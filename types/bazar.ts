export type BazarEntry = {
  id: number;
  date: string;
  amount: number;
  description: string | null;
  user_id: number;
};

export type BazarEntryCreate = {
  date: string;
  amount: number;
  description?: string | null;
};
