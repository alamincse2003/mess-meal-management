import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createExpense } from "@/services/expenses-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddExpenseScreen() {
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
        <View style={styles.header}>
          <ThemedText type="title">Add Expense</ThemedText>
          <ThemedText style={styles.date}>{formatDisplayDate(date)}</ThemedText>
        </View>

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

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

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
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
  },
  error: {
    color: "#DC2626",
  },
});
