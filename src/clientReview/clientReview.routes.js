import { Router } from 'express';
import {
  createClientReview,
  updateClientReview,
  deleteClientReview,
  getAllClientReviews
} from './clientReview.controller.js';
import {
  createClientReviewValidator,
  updateClientReviewValidator
} from '../../helpers/validators.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';

const api = Router();

api.post('/createClientReview', [validateJwt, createClientReviewValidator], createClientReview);
api.put('/updateClientReview/:id', [validateJwt, updateClientReviewValidator], updateClientReview);
api.delete('/deleteClientReview/:id', [validateJwt], deleteClientReview);
api.get('/reviews/client/:clientId', [validateJwt], getAllClientReviews);

export default api;
