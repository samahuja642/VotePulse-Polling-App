import { Router } from 'express';
import {
  createPoll,
  getPublicPolls,
  getMyPolls,
  getPollById,
  updatePoll,
  deletePoll,
} from '../controllers/polls.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, createPoll);
router.get('/public', getPublicPolls);
router.get('/me', requireAuth, getMyPolls);
router.get('/:id', getPollById);
router.patch('/:id', requireAuth, updatePoll);
router.delete('/:id', requireAuth, deletePoll);

export default router;
