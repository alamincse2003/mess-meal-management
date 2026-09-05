import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      <ThemedText style={styles.fieldValue}>{value}</ThemedText>
    </View>
  );
}

export default function AccountScreen() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Account</ThemedText>
        </View>

        <Card style={styles.card}>
          {isLoading ? (
            <ThemedText>Loading profile...</ThemedText>
          ) : user ? (
            <>
              <ProfileField label="Name" value={user.name} />
              <ProfileField label="Email" value={user.email} />
              <ProfileField label="User ID" value={String(user.id)} />
            </>
          ) : (
            <ThemedText>Profile unavailable.</ThemedText>
          )}
        </Card>

        <Button title="Log out" onPress={signOut} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  card: {
    gap: 16,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
  },
});
