import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

function ProfileField({ label, value }: { label: string; value: string }) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <View style={styles.field}>
      <ThemedText style={[styles.fieldLabel, { color: palette.textMuted }]}>
        {label}
      </ThemedText>
      <ThemedText style={styles.fieldValue}>{value}</ThemedText>
    </View>
  );
}

export default function AccountScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user, isLoading, signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Account" />

        {isLoading ? (
          <ThemedText>Loading profile...</ThemedText>
        ) : user ? (
          <>
            <View style={styles.profileHeader}>
              <View style={[styles.avatar, { backgroundColor: palette.tint }]}>
                <ThemedText style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={styles.profileName}>{user.name}</ThemedText>
              <ThemedText style={[styles.profileEmail, { color: palette.textMuted }]}>
                {user.email}
              </ThemedText>
            </View>

            <Card style={styles.card}>
              <ProfileField label="Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="User ID" value={String(user.id)} />
            </Card>
          </>
        ) : (
          <ThemedText>Profile unavailable.</ThemedText>
        )}

        <Button title="Log out" variant="secondary" onPress={signOut} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.xxl,
  },
  profileHeader: {
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
  },
  profileEmail: {
    fontSize: 14,
  },
  card: {
    gap: 16,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});
