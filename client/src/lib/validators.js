import { z } from 'zod';

export const createPollSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional().default(''),
  is_public: z.boolean(),
  multi_vote: z.boolean(),
  show_results: z.boolean(),
  expires_at: z.string().optional().default(''),
  options: z
    .array(z.object({ text: z.string().min(1, 'Option cannot be empty').max(200) }))
    .min(2, 'At least 2 options are required')
    .max(20, 'Maximum 20 options'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerBaseSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
});

export const registerSchema = registerBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] },
);
