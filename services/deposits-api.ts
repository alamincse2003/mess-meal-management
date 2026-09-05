import { apiClient } from "@/services/api-client";
import type { Deposit, DepositCreate } from "@/types/deposit";

export async function getDeposits(): Promise<Deposit[]> {
  const response = await apiClient.get<Deposit[]>("/deposits");
  return response.data;
}

export async function createDeposit(data: DepositCreate): Promise<Deposit> {
  const response = await apiClient.post<Deposit>("/deposits", data);
  return response.data;
}

export async function updateDeposit(
  depositId: number,
  data: DepositCreate
): Promise<Deposit> {
  const response = await apiClient.put<Deposit>(
    `/deposits/${depositId}`,
    data
  );
  return response.data;
}

export async function deleteDeposit(depositId: number): Promise<Deposit> {
  const response = await apiClient.delete<Deposit>(`/deposits/${depositId}`);
  return response.data;
}
