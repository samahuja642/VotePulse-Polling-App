import { z } from 'zod';

export const castVoteSchema = z.object({
  option_ids: z.array(z.string().uuid('Invalid option ID')).min(1, 'At least one option is required'),
  guest_token: z.string().uuid('Invalid guest token').optional().nullable(),
  device_hash: z.string().length(64, 'Invalid device hash').optional().nullable(),
});
