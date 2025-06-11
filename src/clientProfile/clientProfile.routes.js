import { Router } from 'express';
import {
  createClientProfile,
  getAllClientProfiles,
  updateClientProfile,
  deleteClientProfile
} from './clientProfile.controller.js';

import { validateJwt, isClient } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/create', [validateJwt, isClient], createClientProfile);
api.get('/all', validateJwt, getAllClientProfiles);
api.get('/user/:userId', validateJwt, getAllClientProfiles);
api.put('/update', [validateJwt, isClient], updateClientProfile);
api.delete('/delete', [validateJwt, isClient], deleteClientProfile);

export default api;
