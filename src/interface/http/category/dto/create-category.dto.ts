import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
