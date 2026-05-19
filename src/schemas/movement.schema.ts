import z from "zod";

export const createMovementSchema = z.object({
  movement_type: z.enum(["income", "expense"], {
    message: "El tipo de movimiento debe ser 'income' o 'expense'",
  }),
  description: z
    .string()
    .min(1, "La descripción es requerida")
    .max(255, "La descripción no puede exceder los 255 caracteres"),
  amount: z.coerce
    .number({ message: "El monto es requerido" })
    .positive("El monto debe ser un número positivo"),
  category_id: z
    .string()
    .min(1, "La categoría es requerida")
    .uuid("El ID de la categoría no es válido"),
  account_id: z
    .string()
    .min(1, "La cuenta es requerida")
    .uuid("El ID de la cuenta no es válido"),
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'El campo "date" debe tener formato YYYY-MM-DD',
    ),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;

export const validateCreateMovement = (input: CreateMovementInput) => {
  return createMovementSchema.safeParse(input);
};

export const validatePartialMovement = (
  input: Partial<CreateMovementInput>,
) => {
  return createMovementSchema.partial().safeParse(input);
};
