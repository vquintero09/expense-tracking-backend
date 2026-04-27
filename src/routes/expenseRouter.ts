import { Router } from "express";
import { ExpenseController } from "../controllers/expenseController.ts";

export const ExpenseRouter = Router();

ExpenseRouter.get("/", ExpenseController.getAll);
ExpenseRouter.post("/", ExpenseController.create);
ExpenseRouter.delete("/:id", ExpenseController.deleteExpense);
