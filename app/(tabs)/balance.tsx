import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Card } from "@/components/ui/card";
import { ErrorView } from "@/components/ui/error-view";
import { LoadingView } from "@/components/ui/loading-view";
import { useAuth } from "@/contexts/AuthContext";
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
  const isPositive = member.balance >= 0;

  return (
    <Card style={styles.memberCard}>
      <View style={styles.memberHeader}>
        <ThemedText style={styles.memberName}>{member.name}</ThemedText>
        {isYou ? <ThemedText style={styles.youBadge}>You</ThemedText> : null}
      </View>
      <ThemedText style={styles.memberDetail}>
        {member.meals_eaten} meals · deposited {formatCurrency(member.total_deposits)} · share {formatCurrency(member.cost_share)}
      </ThemedText>
      <ThemedText
        style={[
          styles.memberBalance,
          isPositive ? styles.balancePositive : styles.balanceNegative,
        ]}
      >
        {isPositive ? "Gets back " : "Owes "}
        {formatCurrency(Math.abs(member.balance))}
      </ThemedText>
    </Card>
  );
}

export default function BalanceScreen() {
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
        <View style={styles.header}>
          <ThemedText type="title">Balance</ThemedText>
          <ThemedText style={styles.month}>{getCurrentMonthLabel()}</ThemedText>
        </View>

        {isLoading ? (
          <LoadingView label="Loading balance..." />
        ) : error ? (
          <ErrorView message={error} onRetry={loadBalance} />
        ) : (
          <>
            <ThemedText style={styles.mealRate}>
              Meal Rate: {formatCurrency(mealRate)}
            </ThemedText>
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
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  month: {
    fontSize: 16,
  },
  mealRate: {
    fontSize: 16,
    fontWeight: "600",
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
  memberDetail: {
    fontSize: 13,
    opacity: 0.7,
  },
  memberBalance: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  balancePositive: {
    color: "#16A34A",
  },
  balanceNegative: {
    color: "#DC2626",
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
