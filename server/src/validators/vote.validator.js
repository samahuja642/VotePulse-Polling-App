import { z } from 'zod';

export const castVoteSchema = z.object({
  option_id: z.string().uuid('Invalid option ID'),
  guest_token: z.string().uuid('Invalid guest token').optional().nullable(),
});
