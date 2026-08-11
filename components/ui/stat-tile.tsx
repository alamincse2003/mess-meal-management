import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <ThemedText type="subtitle">{value}</ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 13,
    textAlign: "center",
  },
});
