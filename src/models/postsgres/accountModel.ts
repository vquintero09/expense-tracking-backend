import { pool } from "../../db/connection.ts";
import {
  IAccountResponse,
  ICreateAccount,
  IUpdateAccount,
} from "../../types/account.interface.ts";

export class AccountModel {
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
}
