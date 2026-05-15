import { pool } from "../../db/connection.ts";
import { mapExpenseRowToResponse } from "../../mappers/expenseMapper.ts";
import {
  ICreateExpense,
  IExpenseResponse,
} from "../../types/expense.interface.ts";

export class ExpenseModel {
  static async getAllExpenses(): Promise<IExpenseResponse[]> {
    const result = await pool.query(`
        SELECT 
        e.id, e.description, e.amount, e.date,
        c.id AS category_id, c.name AS category_name,
        a.id AS account_id, a.name AS account_name
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        JOIN accounts a ON a.id = e.account_id
        ORDER BY e.date DESC
      `);
    return result.rows.map((e) => mapExpenseRowToResponse(e));
  }

  static async createExpense({
    input,
  }: {
    input: ICreateExpense;
  }): Promise<IExpenseResponse> {
    const { amount, category_id, account_id, date, description } = input;

    const result = await pool.query(
      `
      WITH inserted as (
	      INSERT INTO 
	      expenses (description, amount, date, category_id, account_id)
	      VALUES ($1, $2, $3, $4, $5)
	      RETURNING *
      )
      SELECT i.id, i.description, i.amount, i.date, c.id AS category_id, c.name AS category_name, a.id AS account_id, a.name AS account_name
      FROM inserted i
      JOIN categories c ON c.id = i.category_id
      JOIN accounts a ON a.id = i.account_id
        `,
      [description, amount, date, category_id, account_id],
    );

    const mapped = mapExpenseRowToResponse(result.rows[0]);
    console.log("Mapped Expense:", mapped); // Agrega este log para verificar el mapeo

    return mapped;
  }

  static async deleteExpense({
    id,
  }: {
    id: string;
  }): Promise<IExpenseResponse | null> {
    const result = await pool.query(
      `
      SELECT e.id, e.description, e.amount, e.date,
      c.id AS category_id, c.name AS category_name,
      a.id AS account_id, a.name AS account_name
      FROM expenses e
      JOIN categories c ON c.id = e.category_id
      JOIN accounts a ON a.id = e.account_id
      WHERE e.id = $1
      `,
      [id],
    );

    if (result.rows.length === 0) return null;

    await pool.query(`DELETE FROM expenses WHERE id = $1`, [id]);

    return mapExpenseRowToResponse(result.rows[0]);
  }
}
