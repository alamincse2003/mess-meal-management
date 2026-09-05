import { apiClient } from "@/services/api-client";
import type { BalanceResponse } from "@/types/balance";

export async function getBalance(month: string): Promise<BalanceResponse> {
  const response = await apiClient.get<BalanceResponse>("/balance", {
    params: { month },
  });
  return response.data;
}
