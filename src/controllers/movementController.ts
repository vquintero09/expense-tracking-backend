import { Request, Response } from "express";
import { MovementModel } from "../models/postsgres/movementModel.ts";
import { validateCreateMovement } from "../schemas/movement.schema.ts";
import { error } from "node:console";

export class MovementController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const movements = await MovementModel.getAllMovements();
      res.status(200).json(movements);
    } catch (err) {
      res.status(500).json({ error: "Error al obtener los movimientos" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    const resultValidate = validateCreateMovement(req.body);

    if (!resultValidate.success) {
      res.status(400).json({
        error: "Validación fallida",
        details: resultValidate.error.flatten(),
      });

      return;
    }

    try {
      const newMovement = await MovementModel.createMovement({
        input: resultValidate.data,
      });
      res.status(201).json(newMovement);
    } catch (error) {
      res
        .status(500)
        .json({ error: "Error al crear el movimiento", errormessage: error });
    }
  }

  static async deleteMovement(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const deletedMovement = await MovementModel.deleteMovement({ id });
      res.status(200).json(deletedMovement);
    } catch (error) {
      res.status(500).json({
        error: "Error al eliminar el movimiento",
        errormessage: error,
      });
    }
  }
}
