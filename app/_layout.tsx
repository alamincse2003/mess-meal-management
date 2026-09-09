import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? (
        <Redirect href="/(tabs)" />
      ) : (
        <Redirect href="/(auth)/login" />
      )}
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
