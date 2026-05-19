import { z } from 'zod';

export const updatePollSchema = z.object({
  status: z.enum(['open', 'closed'], { message: "Status must be 'open' or 'closed'" }),
});

export const createPollSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  is_public: z.boolean(),
  multi_vote: z.boolean(),
  show_results: z.boolean(),
  expires_at: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .refine(
      (val) => !val || new Date(val) > new Date(),
      { message: 'Expiry must be in the future' },
    ),
  options: z
    .array(z.string().trim().min(1, 'Option text is required').max(200))
    .min(2, 'At least 2 options are required')
    .max(20, 'Maximum 20 options'),
});
