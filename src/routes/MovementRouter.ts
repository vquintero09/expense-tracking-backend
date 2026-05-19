import { Router } from "express";
import { MovementController } from "../controllers/movementController.ts";

export const MovementRouter = Router();

MovementRouter.get("/", MovementController.getAll);
MovementRouter.post("/", MovementController.create);
MovementRouter.delete("/:id", MovementController.deleteMovement);
