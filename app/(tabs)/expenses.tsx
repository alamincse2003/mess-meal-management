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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { deleteExpense, getExpenses } from "@/services/expenses-api";
import type { Expense } from "@/types/expense";
import { confirmDelete } from "@/utils/confirm";
import { formatDisplayDate, getCurrentMonthLabel } from "@/utils/date";

function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface ExpenseCardProps {
  expense: Expense;
  onEditPress: () => void;
  onDeletePress: () => void;
  isDeleting: boolean;
}

function ExpenseCard({
  expense,
  onEditPress,
  onDeletePress,
  isDeleting,
}: ExpenseCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryDate}>
          {formatDisplayDate(expense.date)}
        </ThemedText>
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
      </View>
      <ThemedText style={[styles.entryCategory, { color: palette.textMuted }]}>
        {expense.category}
      </ThemedText>
      <ThemedText style={styles.entryAmount}>
        {formatAmount(expense.amount)}
      </ThemedText>
      {expense.description ? (
        <ThemedText style={[styles.entryDescription, { color: palette.textMuted }]}>
          {expense.description}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(
    null
  );

  const loadExpenses = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getExpenses();
      setExpenses(data.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const handleDeleteExpense = async (expenseId: number) => {
    setDeletingExpenseId(expenseId);

    try {
      await deleteExpense(expenseId);
      setExpenses((current) =>
        current.filter((expense) => expense.id !== expenseId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const totalThisPage = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Expenses" subtitle={getCurrentMonthLabel()} />

        <Button
          title="Add Expense"
          onPress={() => router.push("/add-expense")}
        />

        <View style={styles.section}>
          <SectionLabel>All Expenses</SectionLabel>
          {isLoading ? (
            <LoadingView label="Loading expenses..." />
          ) : error ? (
            <ErrorView message={error} onRetry={loadExpenses} />
          ) : expenses.length === 0 ? (
            <ThemedText>No expenses found.</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.total}>
                Total: {formatAmount(totalThisPage)}
              </ThemedText>
              <View style={styles.entryList}>
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onEditPress={() =>
                      router.push({
                        pathname: "/edit-expense",
                        params: {
                          id: String(expense.id),
                          date: expense.date,
                          amount: String(expense.amount),
                          category: expense.category,
                          description: expense.description ?? "",
                        },
                      })
                    }
                    onDeletePress={() =>
                      confirmDelete("this expense", () =>
                        handleDeleteExpense(expense.id)
                      )
                    }
                    isDeleting={deletingExpenseId === expense.id}
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
  entryCategory: {
    fontSize: 14,
    fontWeight: "600",
  },
  entryAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  entryDescription: {
    fontSize: 14,
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
