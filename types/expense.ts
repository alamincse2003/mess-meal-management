export type Expense = {
  id: number;
  date: string;
  amount: number;
  category: string;
  description: string | null;
  user_id: number;
};

export type ExpenseCreate = {
  date: string;
  amount: number;
  category: string;
  description?: string | null;
};
