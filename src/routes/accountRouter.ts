import { Router } from "express";
import { AccountController } from "../controllers/accountController.ts";

export const AccountRouter = Router();

AccountRouter.get("/total-balance", AccountController.getTotalBalance);

AccountRouter.get("/", AccountController.getAllAccounts);

AccountRouter.get("/:id", AccountController.getAccount);

AccountRouter.post("/", AccountController.createAccount);

AccountRouter.put("/:id", AccountController.updateAccount);

AccountRouter.delete("/:id", AccountController.deleteAccount);
