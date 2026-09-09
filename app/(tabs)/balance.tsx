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
import { getBalance } from "@/services/balance-api";
import type { MemberBalance } from "@/types/balance";
import { getCurrentMonthLabel, getTodayISO } from "@/utils/date";

function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

interface MemberBalanceCardProps {
  member: MemberBalance;
  isYou: boolean;
}

function MemberBalanceCard({ member, isYou }: MemberBalanceCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const isPositive = member.balance >= 0;
  const balanceColor = isPositive ? palette.success : palette.danger;
  const balanceSurface = isPositive
    ? palette.successSurface
    : palette.dangerSurface;

  return (
    <Card style={styles.memberCard}>
      <View style={styles.memberTopRow}>
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
        <View style={[styles.balancePill, { backgroundColor: balanceSurface }]}>
          <ThemedText style={[styles.balancePillText, { color: balanceColor }]}>
            {isPositive ? "+" : "−"}
            {formatCurrency(Math.abs(member.balance))}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.memberDetail, { color: palette.textMuted }]}>
        {member.meals_eaten} meals · deposited {formatCurrency(member.total_deposits)} · share {formatCurrency(member.cost_share)}
      </ThemedText>
      <ThemedText style={[styles.memberStatus, { color: balanceColor }]}>
        {isPositive ? "Gets back from mess" : "Owes to mess"}
      </ThemedText>
    </Card>
  );
}

export default function BalanceScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const { user } = useAuth();
  const [members, setMembers] = useState<MemberBalance[]>([]);
  const [mealRate, setMealRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBalance = async () => {
    setError("");
    setIsLoading(true);

    try {
      const currentMonth = getTodayISO().slice(0, 7);
      const data = await getBalance(currentMonth);
      setMembers(data.members);
      setMealRate(data.meal_rate);
    } catch (err) {
      console.error(err);
      setError("Failed to load balance. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title="Balance" subtitle={getCurrentMonthLabel()} />

        {isLoading ? (
          <LoadingView label="Loading balance..." />
        ) : error ? (
          <ErrorView message={error} onRetry={loadBalance} />
        ) : (
          <>
            <Card style={[styles.mealRateCard, { backgroundColor: palette.tint }]}>
              <ThemedText style={styles.mealRateLabel}>MEAL RATE</ThemedText>
              <ThemedText style={styles.mealRateValue}>
                {formatCurrency(mealRate)}
              </ThemedText>
            </Card>
            <View style={styles.memberList}>
              {members.map((member) => (
                <MemberBalanceCard
                  key={member.user_id}
                  member={member}
                  isYou={member.user_id === user?.id}
                />
              ))}
            </View>
          </>
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
  mealRateCard: {
    gap: 4,
    borderWidth: 0,
  },
  mealRateLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.8)",
  },
  mealRateValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  memberList: {
    gap: Spacing.md,
  },
  memberCard: {
    gap: 6,
  },
  memberTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  memberDetail: {
    fontSize: 13,
  },
  memberStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  balancePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  balancePillText: {
    fontSize: 14,
    fontWeight: "700",
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
