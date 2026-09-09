import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { ScreenHeader, SectionLabel } from "@/components/ui/screen-header";
import { StatTile } from "@/components/ui/stat-tile";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMeals } from "@/services/meals-api";
import type { Meal } from "@/types/meal";
import { formatDisplayDate, getCurrentMonthLabel, isInCurrentMonth } from "@/utils/date";

function countServed(meals: Meal[], slot: "breakfast" | "lunch" | "dinner") {
  return meals.filter((meal) => meal[slot]).length;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeals = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getMeals();
      setMeals(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load stats. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [])
  );

  const monthMeals = meals
    .filter((meal) => isInCurrentMonth(meal.date))
    .sort((a, b) => b.date.localeCompare(a.date));

  const breakfastCount = countServed(monthMeals, "breakfast");
  const lunchCount = countServed(monthMeals, "lunch");
  const dinnerCount = countServed(monthMeals, "dinner");
  const totalSlotsServed = breakfastCount + lunchCount + dinnerCount;
  const totalSlotsPending = monthMeals.length * 3 - totalSlotsServed;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Monthly Stats" subtitle={getCurrentMonthLabel()} />

        {isLoading ? (
          <LoadingView label="Loading stats..." />
        ) : error ? (
          <ErrorView message={error} onRetry={loadMeals} />
        ) : (
          <>
            <View style={styles.section}>
              <SectionLabel>Meals This Month</SectionLabel>
              <Card style={styles.summaryCard}>
                <StatTile label="Breakfast" value={String(breakfastCount)} />
                <StatTile label="Lunch" value={String(lunchCount)} />
                <StatTile label="Dinner" value={String(dinnerCount)} />
              </Card>
              <View style={{ height: Spacing.md }} />
              <Card style={styles.summaryCard}>
                <StatTile label="Served" value={String(totalSlotsServed)} />
                <StatTile label="Pending" value={String(totalSlotsPending)} />
                <StatTile label="Days Logged" value={String(monthMeals.length)} />
              </Card>
            </View>

            <View style={styles.section}>
              <SectionLabel>Daily Breakdown</SectionLabel>
              {monthMeals.length === 0 ? (
                <ThemedText>No meals logged this month yet.</ThemedText>
              ) : (
                <View style={styles.dayList}>
                  {monthMeals.map((meal) => (
                    <Card key={meal.id} style={styles.dayCard}>
                      <ThemedText style={styles.dayLabel}>
                        {formatDisplayDate(meal.date)}
                      </ThemedText>
                      <ThemedText style={[styles.daySlots, { color: palette.textMuted }]}>
                        {[
                          meal.breakfast && "Breakfast",
                          meal.lunch && "Lunch",
                          meal.dinner && "Dinner",
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No meals served"}
                      </ThemedText>
                    </Card>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
  section: {
    gap: Spacing.md,
  },
  summaryCard: {
    flexDirection: "row",
  },
  dayList: {
    gap: Spacing.sm + 2,
  },
  dayCard: {
    gap: 4,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  daySlots: {
    fontSize: 14,
  },
});
