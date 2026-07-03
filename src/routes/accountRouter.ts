import { Router } from "express";
import { AccountController } from "../controllers/accountController.ts";

export const AccountRouter = Router();

AccountRouter.get("/", AccountController.getAllAccounts);

AccountRouter.get("/:id", AccountController.getAccount);

AccountRouter.post("/", AccountController.createAccount);

AccountRouter.put("/:id", AccountController.updateAccount);

AccountRouter.delete("/:id", AccountController.deleteAccount);

AccountRouter.get("/total-balance", AccountController.getTotalBalance);

AccountRouter.get("/:id/movements", AccountController.getMovementsByAccount);

AccountRouter.post("/:id/adjust", AccountController.adjustBalance);

AccountRouter.post("/:id/transfer", AccountController.transfer);
