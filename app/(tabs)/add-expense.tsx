import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createExpense } from "@/services/expenses-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [date] = useState(getTodayISO());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveExpense = async () => {
    if (isSubmitting) {
      return;
    }

    setError("");

    const parsedAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    if (!category.trim()) {
      setError("Enter a category");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdExpense = await createExpense({
        date,
        amount: parsedAmount,
        category: category.trim(),
        description: description.trim() || null,
      });
      console.log("Expense created:", createdExpense);
      router.back();
    } catch (err) {
      console.error("Failed to create expense:", err);
      setError("Failed to save expense. Please try again.");
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
        <ScreenHeader title="Add Expense" subtitle={formatDisplayDate(date)} />

        <Input
          label="Category"
          placeholder="e.g. Gas, Electricity, Rent"
          value={category}
          onChangeText={setCategory}
        />

        <Input
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Input
          label="Description (optional)"
          placeholder="e.g. September gas bill"
          value={description}
          onChangeText={setDescription}
        />

        {error ? (
          <ThemedText style={[styles.error, { color: palette.danger }]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          title={isSubmitting ? "Saving..." : "Save Expense"}
          onPress={handleSaveExpense}
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
    gap: Spacing.lg,
  },
  error: {
    fontSize: 14,
    fontWeight: "500",
  },
});
