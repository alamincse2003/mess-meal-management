import { ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MealStatusRow, type MealStatus } from "@/components/ui/meal-status-row";
import { StatTile } from "@/components/ui/stat-tile";

const TODAYS_MEALS: { label: string; status: MealStatus }[] = [
  { label: "Breakfast", status: "served" },
  { label: "Lunch", status: "served" },
  { label: "Dinner", status: "pending" },
];

const MONTHLY_SUMMARY = {
  totalMeals: "148",
  totalBazar: "৳12,450",
  mealRate: "৳58.30",
};

const QUICK_ACTIONS = ["Add Meal", "Add Bazar", "Members", "Deposits"];

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Good morning 👋</ThemedText>
          <ThemedText type="title">MessMate</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today&apos;s Meals
          </ThemedText>
          <Card>
            {TODAYS_MEALS.map((meal) => (
              <MealStatusRow key={meal.label} label={meal.label} status={meal.status} />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Monthly Summary
          </ThemedText>
          <Card style={styles.summaryCard}>
            <StatTile label="Total Meals" value={MONTHLY_SUMMARY.totalMeals} />
            <StatTile label="Total Bazar" value={MONTHLY_SUMMARY.totalBazar} />
            <StatTile label="Meal Rate" value={MONTHLY_SUMMARY.mealRate} />
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <View key={action} style={styles.actionItem}>
                <Button title={action} onPress={() => {}} />
              </View>
            ))}
          </View>
        </View>
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
  greeting: {
    fontSize: 16,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  summaryCard: {
    flexDirection: "row",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionItem: {
    width: "47%",
  },
});
