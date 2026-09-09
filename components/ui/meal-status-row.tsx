import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type MealStatus = "served" | "pending";

export interface MealStatusRowProps {
  label: string;
  status: MealStatus;
  onPress?: () => void;
}

export function MealStatusRow({ label, status, onPress }: MealStatusRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isServed = status === "served";

  const content = (
    <View style={styles.row}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isServed
              ? palette.successSurface
              : palette.warningSurface,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.badgeText,
            { color: isServed ? palette.success : palette.warning },
          ]}
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
    fontSize: 15,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
