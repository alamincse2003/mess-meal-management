import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends PressableProps {
  title: string;
  variant?: ButtonVariant;
}

export function Button({
  title,
  style,
  disabled,
  variant = "primary",
  ...rest
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const variantStyle = {
    primary: { backgroundColor: palette.tint },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: palette.border,
    },
    ghost: { backgroundColor: "transparent" },
  }[variant];

  const textColor = {
    primary: "#FFFFFF",
    secondary: palette.text,
    ghost: palette.tint,
  }[variant];

  return (
    <Pressable
      style={(state) => [
        styles.button,
        variantStyle,
        disabled ? styles.buttonDisabled : undefined,
        state.pressed && !disabled ? styles.buttonPressed : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <ThemedText style={[styles.title, { color: textColor }]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
});
