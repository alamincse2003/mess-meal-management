import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { StatTile } from "@/components/ui/stat-tile";
import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user } = useAuth();
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
          <View style={styles.headerText}>
            <ThemedText style={[styles.greeting, { color: palette.textMuted }]}>
              Good morning{user ? `, ${user.name}` : ""} 👋
            </ThemedText>
            <ThemedText type="title">MessMate</ThemedText>
          </View>
          <Pressable
            onPress={() => router.push("/account")}
            style={[styles.avatar, { backgroundColor: palette.tint }]}
          >
            <ThemedText style={styles.avatarText}>
              {user ? user.name.charAt(0).toUpperCase() : "?"}
            </ThemedText>
          </Pressable>
        </View>

        {error ? (
          <ErrorView message={error} onRetry={loadDashboardData} />
        ) : null}

        {!isLoading && !todaysMeal ? (
          <Card
            style={[
              styles.reminderCard,
              { backgroundColor: palette.warningSurface, borderColor: "transparent" },
            ]}
          >
            <ThemedText style={[styles.reminderText, { color: palette.warning }]}>
              You haven&apos;t logged today&apos;s meals yet.
            </ThemedText>
            <Button
              title="Log Now"
              onPress={() => router.push("/add-meal")}
            />
          </Card>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: palette.textMuted }]}>
            TODAY&apos;S MEALS
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
          <ThemedText style={[styles.sectionTitle, { color: palette.textMuted }]}>
            MONTHLY SUMMARY
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
          <ThemedText style={[styles.sectionTitle, { color: palette.textMuted }]}>
            QUICK ACTIONS
          </ThemedText>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.label}
                disabled={!action.href}
                onPress={() => {
                  if (action.href) {
                    router.push(action.href);
                  }
                }}
                style={({ pressed }) => [
                  styles.actionItem,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    opacity: !action.href ? 0.5 : pressed ? 0.7 : 1,
                  },
                ]}
              >
                <ThemedText style={styles.actionLabel}>
                  {action.label}
                </ThemedText>
              </Pressable>
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
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    gap: 2,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  summaryCard: {
    flexDirection: "row",
  },
  reminderCard: {
    gap: Spacing.md,
  },
  reminderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionItem: {
    width: "47%",
    height: 64,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.card,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
