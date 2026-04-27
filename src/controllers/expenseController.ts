import { Request, Response } from "express";
import { ExpenseModel } from "../models/postsgres/expenseModel.ts";

export class ExpenseController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const expenses = await ExpenseModel.getAllExpenses();
      res.status(200).json(expenses);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener los gastos" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const newExpense = await ExpenseModel.createExpense({ input: req.body });
      res.status(201).json(newExpense);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al crear el gasto", errormessage: error });
    }
  }

  static async deleteExpense(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const deletedExpense = await ExpenseModel.deleteExpense({ id });
      res.status(200).json(deletedExpense);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al eliminar el gasto", errormessage: error });
    }
  }
}
