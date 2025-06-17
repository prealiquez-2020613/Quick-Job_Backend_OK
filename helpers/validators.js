import { body, param } from 'express-validator';
import {validateErrorWithoutImg} from './validate.error.js'
import {existEmail, existUsername, findUser, categoryNameExists} from './db.validators.js'

// Validator para registro del usuario
export const registerValidator = [
    body('name', 'Name cannot be empty').notEmpty(),
    body('surname', 'Surname cannot be empty').notEmpty(),
    body('email', 'Email cannot be empty or is not a valid email').notEmpty().isEmail().custom(existEmail),
    body('username', 'Username cannot be empty').notEmpty().toLowerCase().custom(existUsername),
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
    body('profileImage', 'Profile Picture cannot be empty').optional().notEmpty(),
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
    body('username', 'Username cannot be empty').optional().notEmpty().toLowerCase().custom(existUsername),
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
    body('profileImage', 'Profile Picture cannot be empty').optional().notEmpty(),
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


// Validator para crear un pago
export const createPaymentValidator = [
  body('amount', 'Amount is required and must be a positive number')
    .notEmpty()
    .isFloat({ min: 0.01 }),

  body('method', 'Payment method must be one of CARD, PAYPAL, or TRANSFER')
    .notEmpty()
    .isIn(['CARD', 'PAYPAL', 'TRANSFER']),

  body('type', 'Payment type must be one of RECHARGE, JOB, or COMMISSION')
    .notEmpty()
    .isIn(['RECHARGE', 'JOB', 'COMMISSION']),

  body('user', 'User ID must be a valid Mongo ID')
    .optional()
    .isMongoId()
    .bail()
    .custom(findUser),

  validateErrorWithoutImg
];

// Validator para crear una recarga (addRecharge)
export const rechargeCreateValidator = [
  body('amount', 'Amount is required and must be a number greater than 0')
    .notEmpty()
    .isFloat({ min: 0.01 }),

  body('method', 'Method is required and must be one of CARD, PAYPAL, or TRANSFER')
    .notEmpty()
    .isIn(['CARD', 'PAYPAL', 'TRANSFER']),

  validateErrorWithoutImg
];

export const discountCommissionValidator = [
  body('jobAmount', 'Job amount is required and must be a number greater than 0')
    .notEmpty()
    .isFloat({ min: 0.01 }),

  validateErrorWithoutImg
];


// Validaciones para crear una nueva categoría
export const addCategoryValidator = [
    body('name', 'Category name cannot be empty')
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name must be between 1 and 50 characters')
        .custom(categoryNameExists),
    body('description', 'Description is too long')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),
        validateErrorWithoutImg
];

// Validaciones para actualizar una categoría
export const updateCategoryValidator = [
    param('id', 'Invalid category ID')
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ObjectId'),
    body('name', 'Category name cannot be empty')
        .optional()
        .notEmpty()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Category name must be between 1 and 50 characters')
        .custom(categoryNameExists),
    body('description', 'Description is too long')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Description cannot exceed 200 characters'),
        validateErrorWithoutImg
];

// Validaciones para obtener categoría por ID
export const getCategoryValidator = [
    param('id', 'Invalid category ID')
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ObjectId'),
        validateErrorWithoutImg
];

// Validaciones para eliminar categoría
export const deleteCategoryValidator = [
    param('id', 'Invalid category ID')
        .isMongoId()
        .withMessage('Category ID must be a valid MongoDB ObjectId'),
        validateErrorWithoutImg
];

// Validator para crear JobRequest
export const createJobRequestValidator = [
  body('worker', 'Worker ID is required and must be valid').notEmpty().custom(validateErrorWithoutImg),
  body('description', 'Description is required').notEmpty(),
  body('agreedPrice', 'Agreed price is required and must be a number greater than 0')
    .notEmpty()
    .isFloat({ gt: 0 }).withMessage('Agreed price must be greater than 0')
];

// Validator para actualizar JobRequest
export const updateJobRequestStatusValidator = [
  body('status', 'Status is required and must be one of: CONFIRMED, CANCELLED, COMPLETED')
    .notEmpty()
    .isIn(['CONFIRMED', 'CANCELLED', 'COMPLETED'])
];

export const createOrGetChatValidator = [
  body('participantId')
    .notEmpty()
    .withMessage('Participant ID is required')
    .bail(),
  validateErrorWithoutImg
];

export const sendMessageValidator = [
    body('chatId', 'Chat ID is required')
        .notEmpty()
        .custom(value => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Chat ID must be a valid Mongo ID'),
    body('text', 'Message text is required')
        .notEmpty()
        .isString().withMessage('Text must be a string')
        .isLength({ max: 1000 }).withMessage('Message text cannot exceed 1000 characters'),
    validateErrorWithoutImg
];

// --- Worker Review ---
export const createWorkerReviewValidator = [
  body('client', 'Client ID is required and must be valid').notEmpty().isMongoId(),
  body('rating', 'Rating is required and must be between 1 and 5').notEmpty().isFloat({ min: 1, max: 5 }),
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isString()
    .isLength({ max: 300 })
    .withMessage('Comment cannot exceed 300 characters'),
  validateErrorWithoutImg
]

export const updateWorkerReviewValidator = [
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage('Comment cannot exceed 300 characters'),
  validateErrorWithoutImg
]

// --- Client Review ---
export const createClientReviewValidator = [
  body('worker', 'Worker ID is required and must be valid').notEmpty().isMongoId(),
  body('rating', 'Rating is required and must be between 1 and 5').notEmpty().isFloat({ min: 1, max: 5 }),
  body('comment')
    .notEmpty().withMessage('Comment is required')
    .isString()
    .isLength({ max: 300 })
    .withMessage('Comment cannot exceed 300 characters'),
  validateErrorWithoutImg
]

export const updateClientReviewValidator = [
  body('rating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .isLength({ max: 300 })
    .withMessage('Comment cannot exceed 300 characters'),
  validateErrorWithoutImg
]