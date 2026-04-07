import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(1000).optional().default(''),
  is_public: z.boolean().optional().default(true),
  multi_vote: z.boolean().optional().default(false),
  show_results: z.boolean().optional().default(false),
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
