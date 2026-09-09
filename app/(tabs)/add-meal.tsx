import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { MealSlot } from "@/app/(tabs)/meals";
import { createMeal } from "@/services/meals-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

type MealFormData = {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

const INITIAL_FORM: MealFormData = {
  date: getTodayISO(),
  breakfast: false,
  lunch: false,
  dinner: false,
};

function toStatus(served: boolean): MealStatus {
  return served ? "served" : "pending";
}

export default function AddMealScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [form, setForm] = useState<MealFormData>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMeal = (slot: MealSlot) => {
    setForm((current) => ({
      ...current,
      [slot]: !current[slot],
    }));
  };

  const handleSaveMeal = async () => {
    if (isSubmitting) {
      return;
    }

    setError("");

    const hasAtLeastOneMeal = form.breakfast || form.lunch || form.dinner;

    if (!hasAtLeastOneMeal) {
      setError("Select at least one meal");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdMeal = await createMeal(form);
      console.log("Meal created:", createdMeal);
      router.back();
    } catch (error) {
      console.error("Failed to create meal:", error);
      setError("Failed to save meal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Add Meal" subtitle={formatDisplayDate(form.date)} />

        <Card style={styles.card}>
          <MealStatusRow
            label="Breakfast"
            status={toStatus(form.breakfast)}
            onPress={() => toggleMeal("breakfast")}
          />
          <MealStatusRow
            label="Lunch"
            status={toStatus(form.lunch)}
            onPress={() => toggleMeal("lunch")}
          />
          <MealStatusRow
            label="Dinner"
            status={toStatus(form.dinner)}
            onPress={() => toggleMeal("dinner")}
          />
        </Card>

        {error ? (
          <ThemedText style={[styles.error, { color: palette.danger }]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          title={isSubmitting ? "Saving..." : "Save Meal"}
          onPress={handleSaveMeal}
          disabled={isSubmitting}
        />
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
  card: {
    gap: 2,
  },
  error: {
    fontSize: 14,
    fontWeight: "500",
  },
});
