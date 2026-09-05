import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDeposit } from "@/services/deposits-api";
import { formatDisplayDate, getTodayISO } from "@/utils/date";

export default function AddDepositScreen() {
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
        <View style={styles.header}>
          <ThemedText type="title">Add Deposit</ThemedText>
          <ThemedText style={styles.date}>{formatDisplayDate(date)}</ThemedText>
        </View>

        <Input
          label="Amount"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

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
