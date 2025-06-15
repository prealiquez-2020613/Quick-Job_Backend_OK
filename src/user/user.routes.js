import { Router } from 'express';
import { 
    getAll, 
    get, 
    deleteAccount, 
    deleteUser, 
    updateUser, 
    updatePassword, 
    updateRole 
} from './user.controller.js';

import { 
    validateJwt, 
    isAdmin 
} from '../../middlewares/validate.jwt.js';

import { 
    UpdateValidator, 
    newPasswordValidation, 
    deleteAccountValidation, 
    updateRoleValidation 
} from '../../helpers/validators.js';
import upload from '../../middlewares/multer.js'
import cloudinary from '../../configs/cloudinary.js'

const api = Router();

// RUTAS PRIVADAS
api.get('/getAllUsers', [validateJwt, isAdmin], getAll);
api.get('/findUser/:id', [validateJwt, isAdmin], get);
api.put('/deleteAccount', [validateJwt], [deleteAccountValidation], deleteAccount);
api.put('/deleteUser/:userId', [validateJwt, isAdmin], deleteUser);
api.put('/updateUser', [validateJwt, upload.single('image'), UpdateValidator], updateUser);
api.put('/updateUserRole/:id', [validateJwt, isAdmin, updateRoleValidation], updateRole);
api.put('/updatePasswordUser', [validateJwt, newPasswordValidation], updatePassword);

export default api;
