export type Meal = {
  id: number;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  user_id: number;
};

export type MealCreate = {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};

export type MealSummary = {
  total_meal_slots: number;
};
