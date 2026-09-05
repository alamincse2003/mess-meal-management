import { apiClient } from "@/services/api-client";
import type { AuthUser, LoginRequest, LoginResponse } from "@/types/auth";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/users/login",
    credentials
  );
  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>("/users/me");
  return response.data;
}

export async function listUsers(): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[]>("/users");
  return response.data;
}
