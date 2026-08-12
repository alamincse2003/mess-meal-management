import { apiClient } from "@/services/api-client";
import type { Meal, MealCreate } from "@/types/meal";

export async function getMeals(): Promise<Meal[]> {
  const response = await apiClient.get<Meal[]>("/meals");
  return response.data;
}

export async function createMeal(data: MealCreate): Promise<Meal> {
  const response = await apiClient.post<Meal>("/meals", data);
  return response.data;
}
