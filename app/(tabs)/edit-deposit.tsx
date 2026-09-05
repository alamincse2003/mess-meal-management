import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDeposit } from "@/services/deposits-api";
import { formatDisplayDate } from "@/utils/date";

export default function EditDepositScreen() {
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
        <View style={styles.header}>
          <ThemedText type="title">Edit Deposit</ThemedText>
          <ThemedText style={styles.date}>
            {formatDisplayDate(params.date)}
          </ThemedText>
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
