import { apiClient } from "@/services/api-client";
import type { BazarEntry, BazarEntryCreate } from "@/types/bazar";

export async function getBazarEntries(): Promise<BazarEntry[]> {
  const response = await apiClient.get<BazarEntry[]>("/bazar");
  return response.data;
}

export async function createBazarEntry(
  data: BazarEntryCreate
): Promise<BazarEntry> {
  const response = await apiClient.post<BazarEntry>("/bazar", data);
  return response.data;
}

export async function updateBazarEntry(
  entryId: number,
  data: BazarEntryCreate
): Promise<BazarEntry> {
  const response = await apiClient.put<BazarEntry>(`/bazar/${entryId}`, data);
  return response.data;
}

export async function deleteBazarEntry(entryId: number): Promise<BazarEntry> {
  const response = await apiClient.delete<BazarEntry>(`/bazar/${entryId}`);
  return response.data;
}
