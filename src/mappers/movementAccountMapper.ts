import { IMovementItem } from "../types/account.interface.ts";

export const mapMovement = (row: Record<string, unknown>): IMovementItem => ({
  id: row.id as string,
  movement_type: row.movement_type as "income" | "expense",
  description: row.description as string,
  amount: Number(row.amount),
  date: row.date as string,
  category: {
    id: row.category_id as string,
    name: row.category_name as string,
  },
});
