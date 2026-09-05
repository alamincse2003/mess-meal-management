import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "messmate_access_token";

const isWeb = Platform.OS === "web";

export async function saveAccessToken(token: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken(): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
