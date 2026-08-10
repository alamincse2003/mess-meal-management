import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">MessMate</ThemedText>

      <ThemedText style={styles.subtitle}>
        Manage your mess meals easily
      </ThemedText>

      <Pressable style={styles.button} onPress={() => router.push("/login")}>
        <ThemedText style={styles.buttonText}>Get Started</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  subtitle: {
    marginTop: 12,
    textAlign: "center",
  },

  button: {
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: "#2563EB",
  },

  buttonText: {
    color: "#FFFFFF",
  },
});
