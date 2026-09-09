import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { updateDeposit } from "@/services/deposits-api";
import { formatDisplayDate } from "@/utils/date";

export default function EditDepositScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{
    id: string;
    date: string;
    amount: string;
  }>();

  const depositId = Number(params.id);

  const [amount, setAmount] = useState(params.amount);
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
      const updatedDeposit = await updateDeposit(depositId, {
        date: params.date,
        amount: parsedAmount,
      });
      console.log("Deposit updated:", updatedDeposit);
      router.back();
    } catch (err) {
      console.error("Failed to update deposit:", err);
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
        <ScreenHeader
          title="Edit Deposit"
          subtitle={formatDisplayDate(params.date)}
        />

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
