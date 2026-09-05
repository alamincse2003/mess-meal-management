export type MemberBalance = {
  user_id: number;
  name: string;
  meals_eaten: number;
  total_deposits: number;
  cost_share: number;
  balance: number;
};

export type BalanceResponse = {
  month: string;
  meal_rate: number;
  members: MemberBalance[];
};
