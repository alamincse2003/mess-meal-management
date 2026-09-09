import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Radius } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...rest }: InputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? palette.danger
    : isFocused
      ? palette.tint
      : palette.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText style={[styles.label, { color: palette.textMuted }]}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            borderWidth: isFocused || error ? 1.5 : 1,
            backgroundColor: palette.surface,
            color: palette.text,
          },
          style,
        ]}
        placeholderTextColor={palette.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <ThemedText style={[styles.error, { color: palette.danger }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    height: 52,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  error: {
    marginTop: 6,
    fontSize: 13,
  },
});
