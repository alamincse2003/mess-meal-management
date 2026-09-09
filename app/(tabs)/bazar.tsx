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
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Card style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <ThemedText style={styles.entryDate}>
          {formatDisplayDate(entry.date)}
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
      <ThemedText style={styles.entryAmount}>
        {formatAmount(entry.amount)}
      </ThemedText>
      {entry.description ? (
        <ThemedText style={[styles.entryDescription, { color: palette.textMuted }]}>
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
        <ScreenHeader title="Bazar" subtitle={getCurrentMonthLabel()} />

        <Button title="Add Bazar" onPress={() => router.push("/add-bazar")} />

        <View style={styles.section}>
          <SectionLabel>All Entries</SectionLabel>
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
