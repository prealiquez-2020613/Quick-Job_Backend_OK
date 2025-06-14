import { body } from 'express-validator';
import {validateErrorWithoutImg} from './validate.error.js'
import {existEmail, findUser} from './db.validators.js'

// Validator para registro del usuario
export const registerValidator = [
    body('name', 'Name cannot be empty').notEmpty(),
    body('surname', 'Surname cannot be empty').notEmpty(),
    body('email', 'Email cannot be empty or is not a valid email').notEmpty().isEmail().custom(existEmail),
    body('username', 'Username cannot be empty').notEmpty().toLowerCase().custom(findUser),
    body('phone', 'Phone cannot be empty or is not a valid phone').notEmpty(),
    body('role', 'Role must be one of ADMIN, CLIENT, or WORKER').isIn(['ADMIN', 'CLIENT', 'WORKER']).notEmpty(),
    body('location', 'Location must be one of the predefined options').notEmpty()
        .isIn([
            'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'Escuintla', 'Guatemala',
            'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché',
            'Retalhuleu', 'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez',
            'Totonicapán', 'Zacapa'
        ]),
    body('category', 'Category is required and must be a valid ID').optional().notEmpty().isMongoId(),
    body('description', 'Description must not exceed 500 characters').optional().notEmpty().isLength({ max: 500 }),
    body('experienceYears', 'Experience years must be a number').optional().notEmpty().isInt({ min: 0 }),
    validateErrorWithoutImg
];

// Validator para el inicio de sesión del usuario
export const loginValidator = [
    body('identifier', 'Identifier cannot be empty').notEmpty(),
    body('password', 'Password cannot be empty').notEmpty().isLength({min : 8}),
    validateErrorWithoutImg
]

// Validator para la actualización de datos del usuario
export const UpdateValidator = [
    body('name', 'Name cannot be empty').optional().notEmpty(),
    body('surname', 'Surname cannot be empty').optional().notEmpty(),
    body('email', 'Email cannot be empty or is not a valid email').optional().notEmpty().isEmail().custom(existEmail),
    body('username', 'Username cannot be empty').optional().notEmpty().toLowerCase().custom(findUser),
    body('phone', 'Phone cannot be empty or is not a valid phone').optional().notEmpty(),
    body('location', 'Location must be one of the predefined options').optional().notEmpty()
        .isIn([
            'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 'Chiquimula', 'Escuintla', 'Guatemala',
            'Huehuetenango', 'Izabal', 'Jalapa', 'Jutiapa', 'Petén', 'Quetzaltenango', 'Quiché',
            'Retalhuleu', 'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá', 'Suchitepéquez',
            'Totonicapán', 'Zacapa'
        ]),
    body('category', 'Category is required and must be a valid ID').optional().notEmpty().isMongoId(),
    body('description', 'Description must not exceed 500 characters').optional().notEmpty().isLength({ max: 500 }),
    body('experienceYears', 'Experience years must be a number').optional().notEmpty().isInt({ min: 0 }),
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
