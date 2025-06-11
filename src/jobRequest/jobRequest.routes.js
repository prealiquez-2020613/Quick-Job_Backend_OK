import { Router } from 'express';
import {
  createJobRequest,
  getClientJobRequests,
  getWorkerJobRequests,
  updateJobRequestStatus,
  deleteJobRequest
} from './jobRequest.controller.js';

import { validateJwt, isClient, isWorker } from '../../middlewares/validate.jwt.js';

const router = Router();

router.post('/jobrequests', [validateJwt, isClient], createJobRequest);
router.get('/jobrequests/client', [validateJwt, isClient], getClientJobRequests);
router.get('/jobrequests/worker', [validateJwt, isWorker], getWorkerJobRequests);
router.put('/jobrequests/:id/status', [validateJwt, isWorker], updateJobRequestStatus);
router.delete('/deletejobrequests/:id', [validateJwt, isClient], deleteJobRequest);

export default router;
