import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { deleteBazarEntry, getBazarEntries } from "@/services/bazar-api";
import type { BazarEntry } from "@/types/bazar";
import { confirmDelete } from "@/utils/confirm";
import { formatDisplayDate, getCurrentMonthLabel } from "@/utils/date";

function formatAmount(amount: number): string {
  return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface BazarEntryCardProps {
  entry: BazarEntry;
  onEditPress: () => void;
  onDeletePress: () => void;
  isDeleting: boolean;
}

function BazarEntryCard({
  entry,
  onEditPress,
  onDeletePress,
  isDeleting,
}: BazarEntryCardProps) {
  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryDate}>
          {formatDisplayDate(entry.date)}
        </ThemedText>
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
      </View>
      <ThemedText style={styles.entryAmount}>
        {formatAmount(entry.amount)}
      </ThemedText>
      {entry.description ? (
        <ThemedText style={styles.entryDescription}>
          {entry.description}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export default function BazarScreen() {
  const [entries, setEntries] = useState<BazarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

  const loadEntries = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getBazarEntries();
      setEntries(data.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error(err);
      setError("Failed to load bazar entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const handleDeleteEntry = async (entryId: number) => {
    setDeletingEntryId(entryId);

    try {
      await deleteBazarEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingEntryId(null);
    }
  };

  const totalThisPage = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Bazar</ThemedText>
          <ThemedText style={styles.month}>{getCurrentMonthLabel()}</ThemedText>
        </View>

        <Button title="Add Bazar" onPress={() => router.push("/add-bazar")} />

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            All Entries
          </ThemedText>
          {isLoading ? (
            <LoadingView label="Loading bazar entries..." />
          ) : error ? (
            <ErrorView message={error} onRetry={loadEntries} />
          ) : entries.length === 0 ? (
            <ThemedText>No bazar entries found.</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.total}>
                Total: {formatAmount(totalThisPage)}
              </ThemedText>
              <View style={styles.entryList}>
                {entries.map((entry) => (
                  <BazarEntryCard
                    key={entry.id}
                    entry={entry}
                    onEditPress={() =>
                      router.push({
                        pathname: "/edit-bazar",
                        params: {
                          id: String(entry.id),
                          date: entry.date,
                          amount: String(entry.amount),
                          description: entry.description ?? "",
                        },
                      })
                    }
                    onDeletePress={() =>
                      confirmDelete("this bazar entry", () =>
                        handleDeleteEntry(entry.id)
                      )
                    }
                    isDeleting={deletingEntryId === entry.id}
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
  entryDescription: {
    fontSize: 14,
    opacity: 0.7,
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
