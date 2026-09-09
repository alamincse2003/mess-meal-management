import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { login } from "@/services/auth-api";
import { saveAccessToken } from "@/services/auth-storage";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (isSubmitting) {
      return;
    }

    setEmailError("");
    setPasswordError("");
    setFormError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({ email, password });
      await saveAccessToken(response.access_token);
      console.log("Login succeeded, token type:", response.token_type);
      await signIn();
    } catch (error) {
      console.error("Login failed:", error);
      setFormError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.logoMark, { backgroundColor: palette.tint }]}>
          <ThemedText style={styles.logoMarkText}>M</ThemedText>
        </View>

        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: palette.textMuted }]}>
          Log in to continue to MessMate
        </ThemedText>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          error={passwordError}
          secureTextEntry
        />

        {formError ? (
          <ThemedText style={[styles.formError, { color: palette.danger }]}>
            {formError}
          </ThemedText>
        ) : null}

        <Button
          title={isSubmitting ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={isSubmitting}
        />
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xxl,
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },

  logoMark: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },

  logoMarkText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  title: {
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.xxl,
  },

  formError: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.lg,
  },
});
