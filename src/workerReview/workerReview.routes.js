import { Router } from 'express';
import {
  createWorkerReview,
  updateWorkerReview,
  deleteWorkerReview,
  getAllWorkerReviews
} from './workerReview.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/createWorkerReview', [validateJwt], createWorkerReview);
api.put('/updateWorkerReview/:id', [validateJwt], updateWorkerReview);
api.delete('/deleteWorkerReview/:id', [validateJwt], deleteWorkerReview);
api.get('/reviews/worker/:workerId', [validateJwt], getAllWorkerReviews);

export default api;
