import { Request, Response } from "express";
import {
  validateCreateAccount,
  validateUpdateAccount,
} from "../schemas/account.schema.ts";
import { AccountModel } from "../models/postsgres/accountModel.ts";
import { isUniqueViolation } from "../utils/helpers/isUniqueViolation.ts";
import { validate as validateUUID } from "uuid";

export class AccountController {
  static async getAllAccounts(req: Request, res: Response): Promise<void> {
    try {
      const accounts = await AccountModel.getAllAccounts();
      res.status(200).json(accounts);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al obtener las cuentas", errormessage: err });
    }
  }

  static async getAccount(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;

    if (!validateUUID(id)) {
      res.status(404).json({ error: "Cuenta no encontrada" });
      return;
    }

    try {
      const account = await AccountModel.getAccountById({ id });

      if (!account) {
        res.status(404).json({ error: "Cuenta no encontrada" });
        return;
      }

      res.status(200).json(account);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al obtener la cuenta", errormessage: err });
    }
  }

  static async createAccount(req: Request, res: Response): Promise<void> {
    const resultValidation = validateCreateAccount(req.body);

    if (!resultValidation.success) {
      res.status(400).json({
        error: "Validación fallida",
        details: resultValidation.error.flatten(),
      });
      return;
    }

    const validatedData = resultValidation.data;

    try {
      const newAccount = await AccountModel.createNewAccount({
        input: validatedData,
      });

      console.log(newAccount);
      res.status(201).json(newAccount);
      console.log(newAccount);
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(409).json({
          error: "Ya existe una cuenta con ese nombre",
        });
        return;
      }

      res
        .status(500)
        .json({ error: "Error al crear el movimiento", errormessage: err });
    }
  }

  static async updateAccount(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;

    // Validar UUID
    if (!validateUUID(id)) {
      res.status(404).json({ error: "Cuenta no encontrada" });
      return;
    }

    const resultValidation = validateUpdateAccount(req.body);

    if (!resultValidation.success) {
      res.status(400).json({
        error: "Validación faliida",
        details: resultValidation.error.flatten(),
      });
      return;
    }

    const validateData = resultValidation.data;

    try {
      const updateAccount = await AccountModel.updateAccount({
        id,
        inputData: validateData,
      });

      if (!updateAccount) {
        res.status(404).json({ error: "Cuenta no encontrada" });
        return;
      }

      res.status(200).json(updateAccount);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al actualizar la cuenta", errorMessage: err });
    }
  }

  static async deleteAccount(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;

    if (!validateUUID(id)) {
      res.status(400).json({ error: "Cuenta no encontrada" });
      return;
    }

    try {
      const deletedAccount = await AccountModel.deleteAccount({ id });

      if (!deletedAccount) {
        res.status(404).json({ error: "Cuenta no encontrada" });
        return;
      }

      res.status(200).json(deletedAccount);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al eliminar la cuenta", errorMessage: err });
    }
  }

  static async getTotalBalance(_req: Request, res: Response): Promise<void> {
    try {
      const total = await AccountModel.getTotalBalance();
      res.status(200).json(total);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al obtener el total", errormessage: err });
    }
  }

  static async getMovementsByAccount(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<void> {
    const { id } = req.params;

    if (!validateUUID(id)) {
      res.status(400).json({ error: "Cuenta no encontrada" });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;

    try {
      const AccountMovements = await AccountModel.getMovementsByAccount({
        id,
        limit,
        page,
        from,
        to,
      });

      res.status(200).json(AccountMovements);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al obtener los movimientos", errormessage: err });
    }
  }
}
