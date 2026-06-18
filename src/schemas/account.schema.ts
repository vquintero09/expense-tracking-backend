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

export type createAccountInput = z.infer<typeof createAccountSchema>;

export const validateCreateAccount = (inputData: createAccountInput) => {
  return createAccountSchema.safeParse(inputData);
};
