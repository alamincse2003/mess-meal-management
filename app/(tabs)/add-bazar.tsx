import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBazarEntry } from "@/services/bazar-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddBazarScreen() {
  const [date] = useState(getTodayISO());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveEntry = async () => {
    if (isSubmitting) {
      return;
    }

    setError("");

    const parsedAmount = Number(amount);

    if (!amount.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdEntry = await createBazarEntry({
        date,
        amount: parsedAmount,
        description: description.trim() || null,
      });
      console.log("Bazar entry created:", createdEntry);
      router.back();
    } catch (err) {
      console.error("Failed to create bazar entry:", err);
      setError("Failed to save bazar entry. Please try again.");
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
          <ThemedText type="title">Add Bazar</ThemedText>
          <ThemedText style={styles.date}>{formatDisplayDate(date)}</ThemedText>
        </View>

        <Input
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <Input
          label="Description (optional)"
          placeholder="e.g. Rice, vegetables, fish"
          value={description}
          onChangeText={setDescription}
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

        <Button
          title={isSubmitting ? "Saving..." : "Save Bazar Entry"}
          onPress={handleSaveEntry}
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
