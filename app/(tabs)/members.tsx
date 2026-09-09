import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { listUsers } from "@/services/auth-api";
import type { AuthUser } from "@/types/auth";

interface MemberCardProps {
  member: AuthUser;
  isYou: boolean;
}

function MemberCard({ member, isYou }: MemberCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <Card style={styles.memberCard}>
      <View style={[styles.avatar, { backgroundColor: palette.tint }]}>
        <ThemedText style={styles.avatarText}>
          {member.name.charAt(0).toUpperCase()}
        </ThemedText>
      </View>
      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <ThemedText style={styles.memberName}>{member.name}</ThemedText>
          {isYou ? (
            <View style={[styles.youBadge, { backgroundColor: palette.tint + "1A" }]}>
              <ThemedText style={[styles.youBadgeText, { color: palette.tint }]}>
                You
              </ThemedText>
            </View>
          ) : null}
        </View>
        <ThemedText style={[styles.memberEmail, { color: palette.textMuted }]}>
          {member.email}
        </ThemedText>
      </View>
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
        <ScreenHeader
          title="Members"
          subtitle={
            isLoading
              ? undefined
              : `${members.length} member${members.length === 1 ? "" : "s"}`
          }
        />

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
    padding: Spacing.xl,
    paddingBottom: 40,
    gap: Spacing.xxl,
  },
  memberList: {
    gap: Spacing.md,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "700",
  },
  memberEmail: {
    fontSize: 13,
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
