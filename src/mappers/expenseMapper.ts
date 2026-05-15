import { IExpenseResponse } from "../types/expense.interface.ts";

//interfaz para representar la fila aplanada que devuelve el JOIN en PostgreSQL
//Es la interfaz interna del mapper, no se expone fuera

export interface IExpenseRow {
  id: string;
  amount: number;
  category_id: string;
  category_name: string; // Agregado para mapear el nombre de la categoría
  account_id: string;
  account_name: string; // Agregado para mapear el nombre de la cuenta
  date: string;
  description: string;
}
export const mapExpenseRowToResponse = (row: IExpenseRow): IExpenseResponse => {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    category: {
      id: row.category_id,
      name: row.category_name,
    },
    account: {
      id: row.account_id,
      name: row.account_name,
    },
  };
};
