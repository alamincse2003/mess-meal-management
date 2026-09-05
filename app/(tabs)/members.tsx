import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { useAuth } from "@/contexts/AuthContext";
import { listUsers } from "@/services/auth-api";
import type { AuthUser } from "@/types/auth";

interface MemberCardProps {
  member: AuthUser;
  isYou: boolean;
}

function MemberCard({ member, isYou }: MemberCardProps) {
  return (
    <Card style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <ThemedText style={styles.memberName}>{member.name}</ThemedText>
        {isYou ? <ThemedText style={styles.youBadge}>You</ThemedText> : null}
      </View>
      <ThemedText style={styles.memberEmail}>{member.email}</ThemedText>
    </Card>
  );
}

export default function MembersScreen() {
  const { user } = useAuth();
  const [members, setMembers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMembers = async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await listUsers();
      setMembers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load members. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMembers();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Members</ThemedText>
          <ThemedText style={styles.subtitle}>
            {isLoading ? "" : `${members.length} member${members.length === 1 ? "" : "s"}`}
          </ThemedText>
        </View>

        {isLoading ? (
          <LoadingView label="Loading members..." />
        ) : error ? (
          <ErrorView message={error} onRetry={loadMembers} />
        ) : members.length === 0 ? (
          <ThemedText>No members found.</ThemedText>
        ) : (
          <View style={styles.memberList}>
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isYou={member.id === user?.id}
              />
            ))}
          </View>
        )}
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
  subtitle: {
    fontSize: 16,
  },
  memberList: {
    gap: 12,
  },
  memberCard: {
    gap: 4,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
  },
  memberEmail: {
    fontSize: 14,
    opacity: 0.7,
  },
  youBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  error: {
    color: "#DC2626",
  },
});
