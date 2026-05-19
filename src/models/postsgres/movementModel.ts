import { pool } from "../../db/connection.ts";
import { mapMovementRowToResponse } from "../../mappers/movementMapper.ts";
import {
  ICreateMovement,
  IMovementResponse,
} from "../../types/movement.interface.ts";

export class MovementModel {
  static async getAllMovements(): Promise<IMovementResponse[]> {
    const result = await pool.query(`
        SELECT 
        e.id, e.movement_type, e.description, e.amount, e.date,
        c.id AS category_id, c.name AS category_name,
        a.id AS account_id, a.name AS account_name
        FROM expenses e
        JOIN categories c ON c.id = e.category_id
        JOIN accounts a ON a.id = e.account_id
        ORDER BY e.date DESC
      `);
    return result.rows.map((e) => mapMovementRowToResponse(e));
  }

  static async createMovement({
    input,
  }: {
    input: ICreateMovement;
  }): Promise<IMovementResponse> {
    const {
      movement_type,
      amount,
      category_id,
      account_id,
      date,
      description,
    } = input;

    const result = await pool.query(
      `
      WITH inserted as (
	      INSERT INTO 
	      expenses (movement_type, description, amount, date, category_id, account_id)
	      VALUES ($1, $2, $3, $4, $5, $6)
	      RETURNING *
      )
      SELECT i.id, i.movement_type, i.description, i.amount, i.date, c.id AS category_id, c.name AS category_name, a.id AS account_id, a.name AS account_name
      FROM inserted i
      JOIN categories c ON c.id = i.category_id
      JOIN accounts a ON a.id = i.account_id
        `,
      [movement_type, description, amount, date, category_id, account_id],
    );

    const mapped = mapMovementRowToResponse(result.rows[0]);
    console.log("Mapped Movement:", mapped); // Agrega este log para verificar el mapeo

    return mapped;
  }

  static async deleteMovement({
    id,
  }: {
    id: string;
  }): Promise<IMovementResponse | null> {
    const result = await pool.query(
      `
      SELECT e.id, e.movement_type, e.description, e.amount, e.date,
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

    return mapMovementRowToResponse(result.rows[0]);
  }
}
