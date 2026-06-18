import { pool } from "../../db/connection.ts";
import {
  IAccountResponse,
  ICreateAccount,
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
}
