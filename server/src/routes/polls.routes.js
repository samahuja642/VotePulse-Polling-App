import { Router } from 'express';
import {
  createPoll,
  getMyPolls,
  getPublicPolls,
  getPollById,
  updatePoll,
  deletePoll,
} from '../controllers/polls.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPollSchema, updatePollSchema } from '../validators/poll.validator.js';
import { createPollLimiter } from '../middleware/rateLimiter.js';
import { verifyCaptcha } from '../middleware/captcha.js';

const router = Router();

router.post('/', requireAuth, createPollLimiter, verifyCaptcha, validate(createPollSchema), createPoll);
router.get('/me', requireAuth, getMyPolls);
router.get('/public', getPublicPolls);
router.get('/:id', getPollById);
router.patch('/:id', requireAuth, validate(updatePollSchema), updatePoll);
router.delete('/:id', requireAuth, deletePoll);

export default router;
