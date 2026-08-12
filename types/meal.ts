export type Meal = {
  id: number;
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  createdAt: string;
};

export type MealCreate = {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
};
