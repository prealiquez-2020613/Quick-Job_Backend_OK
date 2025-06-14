import { body } from 'express-validator';
import {validateErrorWithoutImg} from './validate.error.js'
import {existEmail, findUser} from './db.validators.js'


// Validator para la actualización de datos del usuario
export const UpdateValidator = [
    body('name', 'Name cannot be empty').optional().notEmpty(),
    body('surname', 'Surname cannot be empty').optional().notEmpty(),
    body('email', 'Email cannot be empty or is not a valid email').optional().notEmpty().isEmail().custom(existEmail),
    body('username', 'Username cannot be empty').optional().notEmpty().toLowerCase().custom(findUser),
    body('phone', 'Phone cannot be empty or is not a valid phone').optional().notEmpty(),
    validateErrorWithoutImg
];

// Validator para la actualización de la contraseña
export const newPasswordValidation = [
    body('actualPassword', 'Actual password is required').notEmpty(),
    body('newPassword', 'New password cannot be empty and must be at least 8 characters and strong').notEmpty().isStrongPassword().isLength({ min: 8 }),
    validateErrorWithoutImg
];

// Validator para eliminar la cuenta del usuario
export const deleteAccountValidation = [
    body('password', 'Password is required').notEmpty(),
    validateErrorWithoutImg
];

// Validator para la actualización del rol del usuario
export const updateRoleValidation = [
    body('newRole', 'Role is required').notEmpty().isIn(['ADMIN', 'CLIENT', 'WORKER']).withMessage('Role must be one of ADMIN, CLIENT, or WORKER'),
    validateErrorWithoutImg
];
