import z from "zod";

export const createAccountSchema = z.object({
  name: z
    .string({ error: "El nombre es requerido" })
    .min(1, "El nombre no puede estar vacío")
    .max(50, "El nombre no puede exceder los 50 caracteres"),
  initial_balance: z.coerce
    .number({ message: "El saldo inicial es requerido" })
    .min(0, "El saldo inicial no puede ser negativo"),
  bg_color: z
    .string({ error: "El color es requerido" })
    .min(1, "El color no puede estar vacío")
    .max(50, "El color no puede exceder los 50 caracteres"),
});

export const updateAccountSchema = createAccountSchema
  .omit({ initial_balance: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export const adjustBalanceSchema = z.object({
  new_balance: z.coerce
    .number({ message: "El nuevo saldo es requerido" })
    .min(0, "El saldo no puede ser negativo"),
  reason: z
    .string()
    .max(255, "La razón no puede exceder los 255 caracteres")
    .optional(),
});

export const transferSchema = z.object({
  to_account_id: z
    .string({ error: "La cuenta destino es requerida" })
    .uuid("El ID de la cuenta no es válido"),
  amount: z.coerce
    .number({ message: "El monto es requerido" })
    .positive("El monto debe ser mayor a 0"),
});

export type createAccountInput = z.infer<typeof createAccountSchema>;
export type updateAccountInput = z.infer<typeof updateAccountSchema>;
export type adjustBalanceInput = z.infer<typeof adjustBalanceSchema>;
export type transferInput = z.infer<typeof transferSchema>;

export const validateCreateAccount = (inputData: createAccountInput) => {
  return createAccountSchema.safeParse(inputData);
};

export const validateUpdateAccount = (inputData: updateAccountInput) => {
  return updateAccountSchema.safeParse(inputData);
};

export const validateAdjustBalance = (inputData: adjustBalanceInput) => {
  return adjustBalanceSchema.safeParse(inputData);
};

export const validateTransfer = (inputData: transferInput) =>
  transferSchema.safeParse(inputData);
