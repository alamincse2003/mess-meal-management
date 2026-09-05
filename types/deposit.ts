export type Deposit = {
  id: number;
  date: string;
  amount: number;
  user_id: number;
};

export type DepositCreate = {
  date: string;
  amount: number;
};
