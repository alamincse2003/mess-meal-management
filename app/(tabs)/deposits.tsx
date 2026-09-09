import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { ScreenHeader, SectionLabel } from "@/components/ui/screen-header";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryDate}>
          {formatDisplayDate(deposit.date)}
        </ThemedText>
        {isOwn ? (
          <View style={styles.entryActions}>
            <Pressable onPress={onEditPress} disabled={isDeleting}>
              <ThemedText style={[styles.editText, { color: palette.tint }]}>
                Edit
              </ThemedText>
            </Pressable>
            <Pressable onPress={onDeletePress} disabled={isDeleting}>
              <ThemedText style={[styles.deleteText, { color: palette.danger }]}>
                {isDeleting ? "Deleting..." : "Delete"}
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>
      <ThemedText style={[styles.entryAmount, { color: palette.success }]}>
        +{formatAmount(deposit.amount)}
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
        <ScreenHeader title="Deposits" subtitle={getCurrentMonthLabel()} />

        <Button
          title="Add Deposit"
          onPress={() => router.push("/add-deposit")}
        />

        <View style={styles.section}>
          <SectionLabel>All Deposits</SectionLabel>
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
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.xxl,
  },
  section: {
    gap: Spacing.md,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
  },
  entryList: {
    gap: Spacing.md,
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
    fontSize: 14,
    fontWeight: "600",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
