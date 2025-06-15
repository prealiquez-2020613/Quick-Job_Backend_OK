import { Router } from 'express';
import { addCategory,allCategories, getCategoryById,updateCategory,deleteCategory} from './category.controller.js';
import { validateJwt, isAdmin } from '../../middlewares/validate.jwt.js';
import {addCategoryValidator,updateCategoryValidator,getCategoryValidator,deleteCategoryValidator} from '../../helpers/validators.js ';

const api = Router();

// Crear categoría
api.post('/addcategory', [validateJwt, isAdmin, addCategoryValidator], addCategory);

// Obtener todas las categorías
api.get('/allcategories', [validateJwt], allCategories);

// Obtener una categoría por ID
api.get('/getcategory/:id', [validateJwt, getCategoryValidator], getCategoryById);

// Actualizar categoría
api.put('/updatecategory/:id', [validateJwt, isAdmin, updateCategoryValidator], updateCategory);

// Eliminar categoría
api.delete('/deletecategory/:id', [validateJwt, isAdmin, deleteCategoryValidator], deleteCategory);

export default api;
