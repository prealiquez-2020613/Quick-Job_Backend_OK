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
router.get('/jobrequests/client', [validateJwt], getClientJobRequests);
router.get('/jobrequests/worker', [validateJwt], getWorkerJobRequests);
router.put('/jobrequests/:id', [updateJobRequestStatusValidator, validateJwt], updateJobRequestStatus);
router.delete('/deletejobrequests/:id', [validateJwt], deleteJobRequest);

export default router;
