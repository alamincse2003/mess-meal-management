import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bazar"
        options={{
          title: "Bazar",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.2.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="creditcard.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-meal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-meal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-bazar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-bazar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-expense"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="deposits"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-deposit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-deposit"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="balance"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
