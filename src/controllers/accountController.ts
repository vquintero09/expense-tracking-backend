import { Request, Response } from "express";
import {
  validateCreateAccount,
  validateUpdateAccount,
} from "../schemas/account.schema.ts";
import { AccountModel } from "../models/postsgres/accountModel.ts";
import { isUniqueViolation } from "../utils/helpers/isUniqueViolation.ts";
import { validate as validateUUID } from "uuid";

export class AccountController {
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
}
