import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function ErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View
      style={[styles.container, { backgroundColor: palette.dangerSurface }]}
    >
      <ThemedText style={[styles.message, { color: palette.danger }]}>
        {message}
      </ThemedText>
      <Button title="Retry" variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
  },
});
