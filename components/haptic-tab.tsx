import { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...(props as ComponentProps<typeof Pressable>)}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
