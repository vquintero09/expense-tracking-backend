import { z } from "zod";

export const createCategorySchema = z.object({
  category_type: z.enum(["income", "expense"], {
    message: "El tipo de category debe ser 'income' o 'expense'",
  }),
  name: z
    .string({ error: "El campo name es requerido" })
    .min(1, "El campo name no puede estar vacio")
    .max(100, "el campo name no puede exeder los 100 caracteres"),
  icon: z
    .string()
    .min(1, "El campo icon no pude estar vacio")
    .max(100, "el campo icon no puede exeder los 100 caracteres"),
  bg_color: z
    .string({ error: "El campo color es requerido" })
    .min(1, "El campo color no puede estar vacio")
    .max(100, "el campo color no puede exeder los 100 caracteres"),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Debes enviar al menos un campo para actualizar",
  });

export type createCategoryInput = z.infer<typeof createCategorySchema>;
export type updateCategoryInput = z.infer<typeof updateCategorySchema>;

export const validateCreateCategory = (inputData: createCategoryInput) => {
  return createCategorySchema.safeParse(inputData);
};

export const validateUpdateCategory = (inputData: updateCategoryInput) => {
  return updateCategorySchema.safeParse(inputData);
};
