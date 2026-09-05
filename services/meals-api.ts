import { apiClient } from "@/services/api-client";
import type { Meal, MealCreate, MealSummary } from "@/types/meal";

export async function getMeals(): Promise<Meal[]> {
  const response = await apiClient.get<Meal[]>("/meals");
  return response.data;
}

export async function getMealSummary(month: string): Promise<MealSummary> {
  const response = await apiClient.get<MealSummary>("/meals/summary", {
    params: { month },
  });
  return response.data;
}

export async function createMeal(data: MealCreate): Promise<Meal> {
  const response = await apiClient.post<Meal>("/meals", data);
  return response.data;
}

export async function deleteMeal(mealId: number): Promise<Meal> {
  const response = await apiClient.delete<Meal>(`/meals/${mealId}`);
  return response.data;
}

export async function updateMeal(
  mealId: number,
  data: MealCreate
): Promise<Meal> {
  const response = await apiClient.put<Meal>(`/meals/${mealId}`, data);
  return response.data;
}
