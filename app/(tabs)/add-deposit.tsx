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
import { createDeposit } from "@/services/deposits-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddDepositScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [date] = useState(getTodayISO());
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDeposit = async () => {
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
      const createdDeposit = await createDeposit({
        date,
        amount: parsedAmount,
      });
      console.log("Deposit created:", createdDeposit);
      router.back();
    } catch (err) {
      console.error("Failed to create deposit:", err);
      setError("Failed to save deposit. Please try again.");
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
        <ScreenHeader title="Add Deposit" subtitle={formatDisplayDate(date)} />

        <Input
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {error ? (
          <ThemedText style={[styles.error, { color: palette.danger }]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          title={isSubmitting ? "Saving..." : "Save Deposit"}
          onPress={handleSaveDeposit}
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
