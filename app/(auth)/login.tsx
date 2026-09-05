import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { login } from "@/services/auth-api";
import { saveAccessToken } from "@/services/auth-storage";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
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
        <ThemedText type="title">Login</ThemedText>

        <ThemedText style={styles.subtitle}>
          Welcome back to MessMate
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
          <ThemedText style={styles.formError}>{formError}</ThemedText>
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
    padding: 24,
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 32,
  },

  formError: {
    color: "#DC2626",
    marginBottom: 16,
  },
});
