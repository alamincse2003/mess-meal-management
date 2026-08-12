import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { getMeals } from "@/services/meals-api";
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
}

function DayMealsCard({ day, onTogglePress }: DayMealsCardProps) {
  return (
    <Card style={styles.dayCard}>
      <ThemedText style={styles.dayLabel}>{day.date}</ThemedText>
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

  const handleToggleToday = (slot: MealSlot) => {
    setTodaysMeals((current) => ({
      ...current,
      [slot]: toggleStatus(current[slot]),
    }));
  };

  const loadMeals = async () => {
    try {
      const data = await getMeals();
      setMeals(data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

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
          <View style={styles.recentList}>
            {meals.map((meal) => (
              <DayMealsCard key={meal.id} day={toDayMeals(meal)} />
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
  dayLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
});
