import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import type { MealSlot } from "@/app/(tabs)/meals";

const TODAY_LABEL = "Today, Aug 11";

type MealFormData = {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

const INITIAL_FORM: MealFormData = {
  date: TODAY_LABEL,
  breakfast: false,
  lunch: false,
  dinner: false,
};

function toStatus(served: boolean): MealStatus {
  return served ? "served" : "pending";
}

function simulateSave(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

export default function AddMealScreen() {
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
      await simulateSave();
      console.log("Meal saved:", form);
      router.back();
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
          <ThemedText type="title">Add Meal</ThemedText>
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
