import { pool } from "../../db/connection.ts";
import {
  ICategoryResponse,
  ICreateCategory,
  IUpdateCategory,
} from "../../types/categories.interface.ts";

export class categoryModel {
  static async getAllCategories(): Promise<ICategoryResponse[]> {
    const result = await pool.query(`
      SELECT * FROM categories ORDER BY name ASC
    `);
    return result.rows;
  }

  static async createNewCategory({
    input,
  }: {
    input: ICreateCategory;
  }): Promise<ICategoryResponse> {
    const { category_type, name, icon, bg_color } = input;
    const result = await pool.query(
      `INSERT INTO categories (category_type, name, icon, bg_color)
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [category_type, name, icon, bg_color],
    );
    return result.rows[0];
  }

  static async UpdateCategory({
    id,
    dataInput,
  }: {
    id: string;
    dataInput: IUpdateCategory;
  }): Promise<ICategoryResponse | null> {
    const fields = Object.keys(dataInput) as (keyof IUpdateCategory)[];
    const setClauses = fields
      .map((field, i) => `${field} = $${i + 1}`)
      .join(",");
    const values = fields.map((field) => dataInput[field]);

    const result = await pool.query(
      `UPDATE categories
      SET ${setClauses}
      WHERE id = $${fields.length + 1}
      RETURNING *`,
      [...values, id],
    );

    if (result.rows.length === 0) return null;

    return result.rows[0];
  }

  static async DeleteCategoryById({
    id,
  }: {
    id: string;
  }): Promise<ICategoryResponse | null> {
    // Primero obtener la categoría antes de eliminarla
    const selectResult = await pool.query(
      `SELECT * FROM categories WHERE id = $1`,
      [id],
    );

    if (selectResult.rows.length === 0) {
      return null;
    }

    const categoryToDelete = selectResult.rows[0];

    // Luego eliminarla
    await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);

    return categoryToDelete;
  }
}
