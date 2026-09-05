import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.message}>{message}</ThemedText>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  message: {
    color: "#DC2626",
    fontSize: 14,
  },
});
