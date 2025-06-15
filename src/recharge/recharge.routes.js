import { Router } from 'express';
import {
  addRecharge,
  getRechargeInfo,
  discountCommission
} from './recharge.controller.js';
import { validateJwt, isWorker } from '../../middlewares/validate.jwt.js';
import { rechargeCreateValidator, discountCommissionValidator} from '../../helpers/validators.js';

const api = Router();

api.post('/add', [validateJwt, isWorker, rechargeCreateValidator], addRecharge);
api.get('/info', [validateJwt, isWorker], getRechargeInfo);
api.post('/commission', [validateJwt, isWorker, discountCommissionValidator], discountCommission);


export default api;