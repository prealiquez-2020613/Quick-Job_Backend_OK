import { Router } from 'express';
import {
  createReview,
  getSentReviews,
  getReceivedReviews,
  getUserReceivedReviews,
  updateReview,
  deleteReview
} from './review.controller.js';
import { validateJwt } from '../../middlewares/validate.jwt.js';
import { createReviewValidator, updateReviewValidator } from '../../helpers/validators.js';

const api = Router();

api.post('/createReview', [validateJwt, createReviewValidator], createReview);
api.get('/reviews/sent', [validateJwt], getSentReviews);
api.get('/reviews/received', [validateJwt], getReceivedReviews);
api.get('/reviews/received/:userId', [validateJwt], getUserReceivedReviews);
api.put('/updateReview/:id', [validateJwt, updateReviewValidator], updateReview);
api.delete('/deleteReview/:id', [validateJwt], deleteReview);

export default api;
