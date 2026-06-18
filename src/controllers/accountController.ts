import { Request, Response } from "express";
import { validateCreateAccount } from "../schemas/account.schema.ts";
import { AccountModel } from "../models/postsgres/accountModel.ts";
import { isUniqueViolation } from "../utils/helpers/isUniqueViolation.ts";

export class AccountController {
  static async createAccount(req: Request, res: Response): Promise<void> {
    const resultValiation = validateCreateAccount(req.body);

    if (!resultValiation.success) {
      res.status(400).json({
        error: "Validación fallida",
        details: resultValiation.error.flatten(),
      });
      return;
    }

    const validatedDate = resultValiation.data;

    try {
      const newAccount = await AccountModel.createNewAccount({
        input: validatedDate,
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
}
