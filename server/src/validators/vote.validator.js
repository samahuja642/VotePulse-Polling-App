import { z } from 'zod';

export const castVoteSchema = z.object({
  option_id: z.string().uuid('Invalid option ID'),
  guest_token: z.string().uuid('Invalid guest token').optional().nullable(),
  device_hash: z.string().length(64, 'Invalid device hash').optional().nullable(),
});
