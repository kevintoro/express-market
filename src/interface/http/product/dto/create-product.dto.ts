import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(3).max(100),
  sku: z
    .string()
    .regex(
      /^[A-Za-z0-9-]{6,20}$/,
      'SKU must be alphanumeric or hyphen and 6-20 characters',
    ),
  categoryId: z.string().uuid(),
  price: z.number().positive(),
  minStock: z.number().int().positive(),
  supplier: z.string().min(1),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
