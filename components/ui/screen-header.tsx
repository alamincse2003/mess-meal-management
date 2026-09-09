import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View style={styles.header}>
      <ThemedText type="title">{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={[styles.subtitle, { color: palette.textMuted }]}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <ThemedText style={[styles.sectionLabel, { color: palette.textMuted }]}>
      {children.toUpperCase()}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});
