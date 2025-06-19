import { Router } from 'express';
import {
  createPayment,
  getUserPayments
} from './payment.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';
import { createPaymentValidator } from '../../helpers/validators.js';

const api = Router();
api.post('/create', validateJwt, createPaymentValidator, createPayment);
api.get('/my-payments', validateJwt, getUserPayments);

export default api;
