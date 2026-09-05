import { apiClient } from "@/services/api-client";
import type { Expense, ExpenseCreate } from "@/types/expense";

export async function getExpenses(): Promise<Expense[]> {
  const response = await apiClient.get<Expense[]>("/expenses");
  return response.data;
}

export async function createExpense(data: ExpenseCreate): Promise<Expense> {
  const response = await apiClient.post<Expense>("/expenses", data);
  return response.data;
}

export async function updateExpense(
  expenseId: number,
  data: ExpenseCreate
): Promise<Expense> {
  const response = await apiClient.put<Expense>(
    `/expenses/${expenseId}`,
    data
  );
  return response.data;
}

export async function deleteExpense(expenseId: number): Promise<Expense> {
  const response = await apiClient.delete<Expense>(`/expenses/${expenseId}`);
  return response.data;
}
