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
import { createBazarEntry } from "@/services/bazar-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddBazarScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
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
        <ScreenHeader title="Add Bazar" subtitle={formatDisplayDate(date)} />

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

        {error ? (
          <ThemedText style={[styles.error, { color: palette.danger }]}>
            {error}
          </ThemedText>
        ) : null}

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
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.lg,
  },
  error: {
    fontSize: 14,
    fontWeight: "500",
  },
});
