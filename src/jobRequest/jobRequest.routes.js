import { Router } from 'express';
import {
  createJobRequest,
  getClientJobRequests,
  getWorkerJobRequests,
  updateJobRequestStatus,
  deleteJobRequest
} from './jobRequest.controller.js';

import { validateJwt, isClient, isWorker } from '../../middlewares/validate.jwt.js';

import { createJobRequestValidator, updateJobRequestStatusValidator } from '../../helpers/validators.js';

const router = Router();

router.post('/jobrequests', [createJobRequestValidator, validateJwt], createJobRequest);
router.get('/jobrequests/client', [validateJwt, isClient], getClientJobRequests);
router.get('/jobrequests/worker', [validateJwt, isWorker], getWorkerJobRequests);
router.put('/jobrequests/:id/status', [updateJobRequestStatusValidator, validateJwt, isWorker], updateJobRequestStatus);
router.delete('/deletejobrequests/:id', [validateJwt, isClient], deleteJobRequest);

export default router;
