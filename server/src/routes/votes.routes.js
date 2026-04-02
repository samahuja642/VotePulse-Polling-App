import { Router } from 'express';
import { castVote, getResults } from '../controllers/votes.controller.js';

const router = Router();

router.post('/:id/vote', castVote);
router.get('/:id/results', getResults);

export default router;
