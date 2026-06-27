import { pool } from "../../db/connection.ts";
import { mapMovement } from "../../mappers/movementAccountMapper.ts";
import {
  IAccountMovementsParams,
  IAccountMovementsResponse,
  IAccountResponse,
  IAdjustBalance,
  IAdjustBalanceResponse,
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

  static async getMovementsByAccount({
    id,
    limit,
    page,
    from,
    to,
  }: IAccountMovementsParams): Promise<IAccountMovementsResponse> {
    const offset = (page - 1) * limit;

    //filtros opcionales de fecha
    const consditions = ["e.account_id = $1"];
    const values = [id];
    let paramIndex = 2;

    if (from) {
      consditions.push(`e.date >= $${paramIndex}`);
      values.push(from);
      paramIndex++;
    }

    if (to) {
      consditions.push(`e.date <= $${paramIndex}`);
      values.push(to);
      paramIndex++;
    }

    const whereClause = `WHERE ${consditions.join(" AND ")}`;

    // Query de datos paginados
    const dataResult = await pool.query(
      `SELECT e.id, e.movement_type, e.description, e.amount, e.date, c.id AS category_id, c.name AS category_name
      FROM expenses e
      LEFT JOIN categories c ON c.id = e.category_id
      ${whereClause}
      ORDER BY e.date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset],
    );

    // Query de total de registros (sin paginar)
    const countResult = await pool.query(
      `SELECT COUNT(*) AS TOTAL
      FROM expenses e
      ${whereClause}`,
      [...values],
    );

    const total = Number(countResult.rows[0].total);

    return {
      data: dataResult.rows.map(mapMovement),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  static async accountBalanceAdjustment({
    id,
    input,
  }: {
    id: string;
    input: IAdjustBalance;
  }): Promise<IAdjustBalanceResponse | null> {
    const account = await this.getAccountById({ id });

    if (!account) return null;

    const { new_balance, reason } = input;
    const difference = new_balance - account.current_balance;

    if (difference === 0) {
      throw new Error(
        "El saldo actual ya coincide con el nuevo saldo indicado",
      );
    }

    const movement_type = difference > 0 ? "income" : "expense";
    const movement_amount = Math.abs(difference);
    const description = reason
      ? `Ajuste de saldo: ${reason}`
      : "Ajuste de saldo";

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Necesitamos una categoría de sistema para el ajuste.
      // Buscamos si existe, si no la creamos en la transacción.
      const categoryResult = await client.query(
        `SELECT id from categories WHERE name = 'Ajuste de saldo' LIMIT 1`,
      );

      let adjustmentCategoryId: string;

      if (categoryResult.rows.length > 0) {
        adjustmentCategoryId = categoryResult.rows[0].id;
      } else {
        const newCategory = await client.query(
          `INSERT INTO categories (category_type, name, icon, bg_color)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
          ["expense", "Ajuste de saldo", "other", "gray"],
        );

        adjustmentCategoryId = newCategory.rows[0].id;
      }

      //insertar ajuste de movimiento
      const movementResult = await client.query(
        `INSERT INTO expenses (movement_type, description, amount, date, category_id, account_id)
        VALUES ($1, $2, $3, CURRENT_DATE, $4, $5)`,
        [movement_type, description, movement_amount, adjustmentCategoryId, id],
      );

      await client.query("COMMIT");

      const updatedAccount = await this.getAccountById({ id });

      return {
        account: updatedAccount!,
        adjustment_movement: mapMovement({
          ...movementResult.rows[0],
          category_id: adjustmentCategoryId,
          category_name: "Ajuste de saldo",
        }),
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
