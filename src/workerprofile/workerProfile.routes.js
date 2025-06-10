import { Router } from 'express';
import {
  createWorkerProfile,
  getAllWorkerProfiles,
  getWorkerProfileByUserId,
  updateWorkerProfile,
  deleteWorkerProfile
} from './workerProfile.controller.js';

import { validateJwt, isWorker } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/create', [validateJwt, isWorker], createWorkerProfile);
api.get('/all', validateJwt, getAllWorkerProfiles);
api.get('/user/:userId', validateJwt, getWorkerProfileByUserId);
api.put('/update', [validateJwt, isWorker], updateWorkerProfile);
api.delete('/delete', [validateJwt, isWorker], deleteWorkerProfile);

export default api;
