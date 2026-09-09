import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View style={styles.tile}>
      <ThemedText style={styles.value}>{value}</ThemedText>
      <ThemedText style={[styles.label, { color: palette.textMuted }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  value: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
