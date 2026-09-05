import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

export function LoadingView({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
});
