import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import type { MealSlot } from "@/app/(tabs)/meals";
import { updateMeal } from "@/services/meals-api";

type MealFormData = {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

function toStatus(served: boolean): MealStatus {
  return served ? "served" : "pending";
}

export default function EditMealScreen() {
  const params = useLocalSearchParams<{
    id: string;
    date: string;
    breakfast: string;
    lunch: string;
    dinner: string;
  }>();

  const mealId = Number(params.id);

  const [form, setForm] = useState<MealFormData>({
    date: params.date,
    breakfast: params.breakfast === "true",
    lunch: params.lunch === "true",
    dinner: params.dinner === "true",
  });
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
      const updatedMeal = await updateMeal(mealId, form);
      console.log("Meal updated:", updatedMeal);
      router.back();
    } catch (err) {
      console.error("Failed to update meal:", err);
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
        <View style={styles.header}>
          <ThemedText type="title">Edit Meal</ThemedText>
          <ThemedText style={styles.date}>{form.date}</ThemedText>
        </View>

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

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

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
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  date: {
    fontSize: 16,
  },
  card: {
    gap: 2,
  },
  error: {
    color: "#DC2626",
  },
});
