import { Request, Response } from "express";
import { categoryModel } from "../models/postsgres/categoryModel.ts";
import {
  createCategoryInput,
  updateCategoryInput,
  validateCreateCategory,
  validateUpdateCategory,
} from "../schemas/category.schema.ts";
import { validate as validateUUID } from "uuid";

export class categoryController {
  static async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await categoryModel.getAllCategories();
      res.status(200).json(categories);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Hubo un un error al obtener las categorias", err });
    }
  }

  static async createCategory(req: Request, res: Response): Promise<void> {
    const resultValidation = validateCreateCategory(req.body);

    if (!resultValidation.success) {
      res.status(400).json({
        error: "Validación fallida",
        details: resultValidation.error.flatten(),
      });
      return;
    }

    const validateData = resultValidation.data;

    try {
      const newCategory = await categoryModel.createNewCategory({
        input: validateData,
      });

      res.status(201).json(newCategory);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al crear el movimiento", errormessage: err });
    }
  }

  static async updateCategory(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    // Validar UUID
    if (!validateUUID(id)) {
      res.status(404).json({ error: "Categoría no encontrada" });
      return;
    }

    const resultValiation = validateUpdateCategory(req.body);

    if (!resultValiation.success) {
      res.status(400).json({
        error: "Validación faliida",
        details: resultValiation.error.flatten(),
      });
      return;
    }

    const validateData = resultValiation.data;

    try {
      const updateCategory = await categoryModel.UpdateCategory({
        id,
        dataInput: validateData,
      });

      if (!updateCategory) {
        res.status(404).json({ error: "Categoría no encontrada" });
        return;
      }

      res.status(200).json(updateCategory);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al actualizar la categoría", errorMessage: err });
    }
  }

  static async deleteCategory(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    // Validar UUID
    if (!validateUUID(id)) {
      res.status(404).json({ error: "Categoría no encontrada" });
      return;
    }

    try {
      const deletedCategory = await categoryModel.DeleteCategoryById({ id });

      if (!deletedCategory) {
        res.status(404).json({ error: "Categoría no encontrada" });
        return;
      }

      res.status(200).json(deletedCategory);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error al eliminar la categoría", errorMessage: err });
    }
  }
}
