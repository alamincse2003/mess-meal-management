import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { StatTile } from "@/components/ui/stat-tile";
import { useAuth } from "@/contexts/AuthContext";
import { getBazarEntries } from "@/services/bazar-api";
import { getExpenses } from "@/services/expenses-api";
import { getMealSummary, getMeals } from "@/services/meals-api";
import type { BazarEntry } from "@/types/bazar";
import type { Expense } from "@/types/expense";
import type { Meal } from "@/types/meal";
import { getTodayISO, isInCurrentMonth } from "@/utils/date";

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function toMealStatus(isServed: boolean): MealStatus {
  return isServed ? "served" : "pending";
}

const QUICK_ACTIONS: {
  label: string;
  href:
    | "/add-meal"
    | "/add-bazar"
    | "/members"
    | "/add-expense"
    | "/add-deposit"
    | "/balance"
    | null;
}[] = [
  { label: "Add Meal", href: "/add-meal" },
  { label: "Add Bazar", href: "/add-bazar" },
  { label: "Add Expense", href: "/add-expense" },
  { label: "Members", href: "/members" },
  { label: "Deposits", href: "/add-deposit" },
  { label: "Balance", href: "/balance" },
];

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [bazarEntries, setBazarEntries] = useState<BazarEntry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalMealSlotsThisMonth, setTotalMealSlotsThisMonth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    setError("");
    setIsLoading(true);

    try {
      const currentMonth = getTodayISO().slice(0, 7);
      const [mealsData, bazarData, expensesData, summaryData] =
        await Promise.all([
          getMeals(),
          getBazarEntries(),
          getExpenses(),
          getMealSummary(currentMonth),
        ]);

      setMeals(mealsData);
      setBazarEntries(bazarData);
      setExpenses(expensesData);
      setTotalMealSlotsThisMonth(summaryData.total_meal_slots);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const todaysMeal = meals.find((meal) => meal.date === getTodayISO());
  const totalMealsThisMonth = meals.filter((meal) =>
    isInCurrentMonth(meal.date)
  ).length;

  const totalBazarThisMonth = bazarEntries
    .filter((entry) => isInCurrentMonth(entry.date))
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpensesThisMonth = expenses
    .filter((expense) => isInCurrentMonth(expense.date))
    .reduce((sum, expense) => sum + expense.amount, 0);

  const totalCostThisMonth = totalBazarThisMonth + totalExpensesThisMonth;

  const mealRate =
    totalMealSlotsThisMonth > 0
      ? totalCostThisMonth / totalMealSlotsThisMonth
      : 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>
            Good morning{user ? `, ${user.name}` : ""} 👋
          </ThemedText>
          <ThemedText type="title">MessMate</ThemedText>
        </View>

        <Button title="Account" onPress={() => router.push("/account")} />

        <Button title="Log out" onPress={signOut} />

        {error ? (
          <ErrorView message={error} onRetry={loadDashboardData} />
        ) : null}

        {!isLoading && !todaysMeal ? (
          <Card style={styles.reminderCard}>
            <ThemedText style={styles.reminderText}>
              You haven&apos;t logged today&apos;s meals yet.
            </ThemedText>
            <Button
              title="Log Now"
              onPress={() => router.push("/add-meal")}
            />
          </Card>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today&apos;s Meals
          </ThemedText>
          <Card>
            {isLoading ? (
              <LoadingView label="Loading..." />
            ) : todaysMeal ? (
              <>
                <MealStatusRow
                  label="Breakfast"
                  status={toMealStatus(todaysMeal.breakfast)}
                />
                <MealStatusRow
                  label="Lunch"
                  status={toMealStatus(todaysMeal.lunch)}
                />
                <MealStatusRow
                  label="Dinner"
                  status={toMealStatus(todaysMeal.dinner)}
                />
              </>
            ) : (
              <ThemedText>No meal logged for today yet.</ThemedText>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Monthly Summary
          </ThemedText>
          <Card style={styles.summaryCard}>
            <StatTile
              label="Total Meals"
              value={isLoading ? "—" : String(totalMealsThisMonth)}
            />
            <StatTile
              label="Total Cost"
              value={isLoading ? "—" : formatCurrency(totalCostThisMonth)}
            />
            <StatTile
              label="Meal Rate"
              value={isLoading ? "—" : formatCurrency(mealRate)}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <View key={action.label} style={styles.actionItem}>
                <Button
                  title={action.href ? action.label : `${action.label} (soon)`}
                  disabled={!action.href}
                  onPress={() => {
                    if (action.href) {
                      router.push(action.href);
                    }
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  greeting: {
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  summaryCard: {
    flexDirection: "row",
  },
  reminderCard: {
    gap: 12,
    borderColor: "#F59E0B",
    borderWidth: 1,
  },
  reminderText: {
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "47%",
  },
});
