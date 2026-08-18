import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { deleteMeal, getMeals } from "@/services/meals-api";
import type { Meal } from "@/types/meal";

export interface DayMeals {
  date: string;
  breakfast: MealStatus;
  lunch: MealStatus;
  dinner: MealStatus;
}

export type MealSlot = "breakfast" | "lunch" | "dinner";

const CURRENT_MONTH = "August 2026";

const INITIAL_TODAYS_MEALS: DayMeals = {
  date: "Today, Aug 11",
  breakfast: "served",
  lunch: "pending",
  dinner: "pending",
};

function toggleStatus(status: MealStatus): MealStatus {
  return status === "served" ? "pending" : "served";
}

function toMealStatus(isServed: boolean): MealStatus {
  return isServed ? "served" : "pending";
}

function toDayMeals(meal: Meal): DayMeals {
  return {
    date: meal.date,
    breakfast: toMealStatus(meal.breakfast),
    lunch: toMealStatus(meal.lunch),
    dinner: toMealStatus(meal.dinner),
  };
}

interface DayMealsCardProps {
  day: DayMeals;
  onTogglePress?: (slot: MealSlot) => void;
  onEditPress?: () => void;
  onDeletePress?: () => void;
  isDeleting?: boolean;
}

function DayMealsCard({
  day,
  onTogglePress,
  onEditPress,
  onDeletePress,
  isDeleting,
}: DayMealsCardProps) {
  return (
    <Card style={styles.dayCard}>
      <View style={styles.dayCardHeader}>
        <ThemedText style={styles.dayLabel}>{day.date}</ThemedText>
        <View style={styles.dayCardActions}>
          {onEditPress ? (
            <Pressable onPress={onEditPress} disabled={isDeleting}>
              <ThemedText style={styles.editText}>Edit</ThemedText>
            </Pressable>
          ) : null}
          {onDeletePress ? (
            <Pressable onPress={onDeletePress} disabled={isDeleting}>
              <ThemedText style={styles.deleteText}>
                {isDeleting ? "Deleting..." : "Delete"}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
      <MealStatusRow
        label="Breakfast"
        status={day.breakfast}
        onPress={onTogglePress ? () => onTogglePress("breakfast") : undefined}
      />
      <MealStatusRow
        label="Lunch"
        status={day.lunch}
        onPress={onTogglePress ? () => onTogglePress("lunch") : undefined}
      />
      <MealStatusRow
        label="Dinner"
        status={day.dinner}
        onPress={onTogglePress ? () => onTogglePress("dinner") : undefined}
      />
    </Card>
  );
}

export default function MealsScreen() {
  const [todaysMeals, setTodaysMeals] = useState<DayMeals>(INITIAL_TODAYS_MEALS);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingMealId, setDeletingMealId] = useState<number | null>(null);

  const handleToggleToday = (slot: MealSlot) => {
    setTodaysMeals((current) => ({
      ...current,
      [slot]: toggleStatus(current[slot]),
    }));
  };

  const loadMeals = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getMeals();
      setMeals(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load meals. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  const handleDeleteMeal = async (mealId: number) => {
    setDeletingMealId(mealId);

    try {
      await deleteMeal(mealId);
      setMeals((current) => current.filter((meal) => meal.id !== mealId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingMealId(null);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Meals</ThemedText>
          <ThemedText style={styles.month}>{CURRENT_MONTH}</ThemedText>
        </View>

        <Button title="Add Meal" onPress={() => router.push("/add-meal")} />

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today&apos;s Meal Status
          </ThemedText>
          <DayMealsCard day={todaysMeals} onTogglePress={handleToggleToday} />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Meals
          </ThemedText>
          {isLoading ? (
            <ThemedText>Loading meals...</ThemedText>
          ) : error ? (
            <ThemedText style={styles.error}>{error}</ThemedText>
          ) : meals.length === 0 ? (
            <ThemedText>No meals found.</ThemedText>
          ) : (
            <View style={styles.recentList}>
              {meals.map((meal) => (
                <DayMealsCard
                  key={meal.id}
                  day={toDayMeals(meal)}
                  onEditPress={() =>
                    router.push({
                      pathname: "/edit-meal",
                      params: {
                        id: String(meal.id),
                        date: meal.date,
                        breakfast: String(meal.breakfast),
                        lunch: String(meal.lunch),
                        dinner: String(meal.dinner),
                      },
                    })
                  }
                  onDeletePress={() => handleDeleteMeal(meal.id)}
                  isDeleting={deletingMealId === meal.id}
                />
              ))}
            </View>
          )}
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
  month: {
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  recentList: {
    gap: 12,
  },
  dayCard: {
    gap: 2,
  },
  dayCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  dayCardActions: {
    flexDirection: "row",
    gap: 16,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  editText: {
    color: "#2563EB",
    fontSize: 14,
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 14,
  },
  error: {
    color: "#DC2626",
  },
});
