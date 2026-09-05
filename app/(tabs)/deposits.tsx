import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { useAuth } from "@/contexts/AuthContext";
import { deleteDeposit, getDeposits } from "@/services/deposits-api";
import type { Deposit } from "@/types/deposit";
import { confirmDelete } from "@/utils/confirm";
import { formatDisplayDate, getCurrentMonthLabel } from "@/utils/date";

function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface DepositCardProps {
  deposit: Deposit;
  isOwn: boolean;
  onEditPress: () => void;
  onDeletePress: () => void;
  isDeleting: boolean;
}

function DepositCard({
  deposit,
  isOwn,
  onEditPress,
  onDeletePress,
  isDeleting,
}: DepositCardProps) {
  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryDate}>
          {formatDisplayDate(deposit.date)}
        </ThemedText>
        {isOwn ? (
          <View style={styles.entryActions}>
            <Pressable onPress={onEditPress} disabled={isDeleting}>
              <ThemedText style={styles.editText}>Edit</ThemedText>
            </Pressable>
            <Pressable onPress={onDeletePress} disabled={isDeleting}>
              <ThemedText style={styles.deleteText}>
                {isDeleting ? "Deleting..." : "Delete"}
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>
      <ThemedText style={styles.entryAmount}>
        {formatAmount(deposit.amount)}
      </ThemedText>
    </Card>
  );
}

export default function DepositsScreen() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingDepositId, setDeletingDepositId] = useState<number | null>(
    null
  );

  const loadDeposits = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getDeposits();
      setDeposits(data.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error(err);
      setError("Failed to load deposits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDeposits();
    }, [])
  );

  const handleDeleteDeposit = async (depositId: number) => {
    setDeletingDepositId(depositId);

    try {
      await deleteDeposit(depositId);
      setDeposits((current) =>
        current.filter((deposit) => deposit.id !== depositId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingDepositId(null);
    }
  };

  const totalThisPage = deposits.reduce(
    (sum, deposit) => sum + deposit.amount,
    0
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Deposits</ThemedText>
          <ThemedText style={styles.month}>{getCurrentMonthLabel()}</ThemedText>
        </View>

        <Button
          title="Add Deposit"
          onPress={() => router.push("/add-deposit")}
        />

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            All Deposits
          </ThemedText>
          {isLoading ? (
            <LoadingView label="Loading deposits..." />
          ) : error ? (
            <ErrorView message={error} onRetry={loadDeposits} />
          ) : deposits.length === 0 ? (
            <ThemedText>No deposits found.</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.total}>
                Total: {formatAmount(totalThisPage)}
              </ThemedText>
              <View style={styles.entryList}>
                {deposits.map((deposit) => (
                  <DepositCard
                    key={deposit.id}
                    deposit={deposit}
                    isOwn={deposit.user_id === user?.id}
                    onEditPress={() =>
                      router.push({
                        pathname: "/edit-deposit",
                        params: {
                          id: String(deposit.id),
                          date: deposit.date,
                          amount: String(deposit.amount),
                        },
                      })
                    }
                    onDeletePress={() =>
                      confirmDelete("this deposit", () =>
                        handleDeleteDeposit(deposit.id)
                      )
                    }
                    isDeleting={deletingDepositId === deposit.id}
                  />
                ))}
              </View>
            </>
          )}
        </View>
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
  month: {
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  total: {
    fontSize: 16,
    fontWeight: "600",
  },
  entryList: {
    gap: 12,
  },
  entryCard: {
    gap: 4,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  entryActions: {
    flexDirection: "row",
    gap: 16,
  },
  entryDate: {
    fontSize: 15,
    fontWeight: "600",
  },
  entryAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  editText: {
    color: "#2563EB",
    fontSize: 14,
  },
  deleteText: {
    color: "#DC2626",
    fontSize: 14,
  },
  error: {
    color: "#DC2626",
  },
});
