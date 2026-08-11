import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export type MealStatus = "served" | "pending";

export interface MealStatusRowProps {
  label: string;
  status: MealStatus;
  onPress?: () => void;
}

export function MealStatusRow({ label, status, onPress }: MealStatusRowProps) {
  const isServed = status === "served";

  const content = (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View
        style={[styles.badge, isServed ? styles.badgeServed : styles.badgePending]}
      >
        <ThemedText
          style={[styles.badgeText, isServed ? styles.badgeTextServed : styles.badgeTextPending]}
        >
          {isServed ? "Served" : "Pending"}
        </ThemedText>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeServed: {
    backgroundColor: "#DCFCE7",
  },
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  badgeTextServed: {
    color: "#15803D",
  },
  badgeTextPending: {
    color: "#B45309",
  },
});
