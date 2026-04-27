import { pool } from "../../db/connection.ts";
import { IExpense, CreateExpense } from "../../types/expense.interface.ts";

export class ExpenseModel {
  static async getAllExpenses(): Promise<IExpense[]> {
    const result = await pool.query("SELECT * FROM expenses");
    return result.rows;
  }

  static async createExpense({
    input,
  }: {
    input: CreateExpense;
  }): Promise<IExpense> {
    const { amount, category_id, account_id, date, description } = input;

    const result = await pool.query(
      `INSERT INTO expenses (amount, category_id, account_id, date, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [amount, category_id, account_id, date, description ?? null],
    );

    return result.rows[0];
  }

  static async deleteExpense({ id }: { id: string }): Promise<IExpense | null> {
    const result = await pool.query(
      `DELETE FROM expenses WHERE id = $1 RETURNING *`,
      [id],
    );

    return result.rows[0] ?? null;
  }
}
