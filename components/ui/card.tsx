import { StyleSheet, View, type ViewProps } from "react-native";

import { Colors, Radius, Shadow, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type CardProps = ViewProps;

export function Card({ style, ...rest }: CardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadow.card,
  },
});
