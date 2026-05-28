import { Router } from 'express';
import { castVote, checkVote, getResults } from '../controllers/votes.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { castVoteSchema } from '../validators/vote.validator.js';
import { voteLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/:id/vote', optionalAuth, voteLimiter, validate(castVoteSchema), castVote);
router.get('/:id/vote', optionalAuth, checkVote);
router.get('/:id/results', optionalAuth, getResults);

export default router;
