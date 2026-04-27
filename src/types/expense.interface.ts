export interface IExpense {
  id: string;
  amount: number;
  category_id: string;
  account_id: string;
  date: string;
  description?: string;
}

export type CreateExpense = Omit<IExpense, "id">;
