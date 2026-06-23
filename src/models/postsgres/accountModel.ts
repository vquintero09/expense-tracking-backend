import { pool } from "../../db/connection.ts";
import {
  IAccountResponse,
  ICreateAccount,
  ITotalBalance,
  IUpdateAccount,
} from "../../types/account.interface.ts";

export class AccountModel {
  static async getAllAccounts(): Promise<IAccountResponse[]> {
    const result = await pool.query<IAccountResponse>(
      `SELECT
        a.id,
        a.name,
        a.initial_balance,
        a.bg_color,
        a.created_at,
        a.updated_at,
        a.initial_balance + COALESCE(SUM(
          CASE 
            WHEN e.movement_type = 'income' THEN e.amount
            WHEN e.movement_type = 'expense' THEN -e.amount
            ELSE 0
          END
        ), 0) AS current_balance
        FROM accounts a
        LEFT JOIN expenses e ON e.account_id = a.id
        GROUP BY a.id, a.name, a.initial_balance, a.bg_color, a.created_at, a.updated_at
        ORDER BY a.created_at ASC`,
    );

    return result.rows.map((row) => ({
      ...row,
      initial_balance: Number(row.initial_balance),
      current_balance: Number(row.current_balance),
    }));
  }

  static async getAccountById({
    id,
  }: {
    id: string;
  }): Promise<IAccountResponse | null> {
    const result = await pool.query<IAccountResponse>(
      `SELECT
        a.id,
        a.name,
        a.initial_balance,
        a.bg_color,
        a.created_at,
        a.updated_at,
        a.initial_balance + COALESCE(SUM(
          CASE 
            WHEN e.movement_type = 'income' THEN e.amount
            WHEN e.movement_type = 'expense' THEN -e.amount
            ELSE 0
          END
        ), 0) AS current_balance
        FROM accounts a
        LEFT JOIN expenses e ON e.account_id = a.id
        WHERE a.id = $1
        GROUP BY a.id, a.name, a.initial_balance, a.bg_color, a.created_at, a.updated_at`,
      [id],
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      ...row,
      initial_balance: Number(row.initial_balance),
      current_balance: Number(row.current_balance),
    };
  }

  static async createNewAccount({
    input,
  }: {
    input: ICreateAccount;
  }): Promise<IAccountResponse> {
    const { name, initial_balance, bg_color } = input;
    const result = await pool.query(
      `INSERT INTO accounts (name, initial_balance, bg_color)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [name, initial_balance, bg_color],
    );

    const created = result.rows[0];

    return {
      ...created,
      initial_balance: Number(created.initial_balance),
      current_balance: Number(created.initial_balance),
    };
  }

  //Edita nombre y/o color de una cuenta
  static async updateAccount({
    id,
    inputData,
  }: {
    inputData: IUpdateAccount;
    id: string;
  }): Promise<IAccountResponse | null> {
    const fields = Object.keys(inputData) as (keyof IUpdateAccount)[];
    const setCluases = fields
      .map((field, i) => `${field} = $${i + 1}`)
      .join(",");
    const values = fields.map((field) => inputData[field]);

    const result = await pool.query(
      `UPDATE accounts
      SET ${setCluases}
      WHERE id = $${fields.length + 1}
      RETURNING *`,
      [...values, id],
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
  }

  static async deleteAccount({
    id,
  }: {
    id: string;
  }): Promise<IAccountResponse | null> {
    const seletecAccount = await pool.query(
      `SELECT * FROM accounts WHERE id = $1`,
      [id],
    );

    if (seletecAccount.rows.length === 0) return null;

    const accountToDelete = seletecAccount.rows[0];

    await pool.query(`DELETE FROM accounts WHERE id = $1`, [id]);

    return accountToDelete;
  }

  static async getTotalBalance(): Promise<ITotalBalance> {
    const result = await pool.query(
      `WITH account_balances AS (
        select a.id, a.initial_balance + COALESCE(SUM(
          CASE 
            WHEN e.movement_type = 'income' THEN e.amount
            WHEN e.movement_type = 'expense' THEN -e.amount
            ELSE 0
          END
        ), 0) AS current_balance
        FROM accounts a
        LEFT JOIN expenses e ON e.account_id = a.id
        GROUP BY a.id, a.initial_balance
      )
      -- Consulta principal que utiliza la CTE
      SELECT SUM(current_balance) as total_accounts_balance
      FROM account_balances;`,
    );

    return {
      total_accounts_balance: Number(result.rows[0].total_accounts_balance),
    };
  }
}
