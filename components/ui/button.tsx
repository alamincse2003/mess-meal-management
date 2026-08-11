import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { ThemedText } from "@/components/themed-text";

export interface ButtonProps extends PressableProps {
  title: string;
}

export function Button({ title, style, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      style={(state) => [
        styles.button,
        disabled ? styles.buttonDisabled : undefined,
        state.pressed && !disabled ? styles.buttonPressed : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <ThemedText style={styles.title}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  title: {
    color: "#FFFFFF",
  },
});
