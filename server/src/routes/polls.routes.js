import { Router } from 'express';
import {
  createPoll,
  getMyPolls,
  getPollById,
  updatePoll,
  deletePoll,
} from '../controllers/polls.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPollSchema } from '../validators/poll.validator.js';

const router = Router();

router.post('/', requireAuth, validate(createPollSchema), createPoll);
router.get('/me', requireAuth, getMyPolls);
router.get('/:id', getPollById);
router.patch('/:id', requireAuth, updatePoll);
router.delete('/:id', requireAuth, deletePoll);

export default router;
