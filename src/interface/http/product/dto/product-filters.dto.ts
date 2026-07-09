import { z } from 'zod';

export const ProductFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  supplier: z.string().optional(),
  hasActiveAlert: z.coerce.boolean().optional(),
  stockMin: z.coerce.number().int().min(0).optional(),
  stockMax: z.coerce.number().int().min(0).optional(),
});

export type ProductFiltersDto = z.infer<typeof ProductFiltersSchema>;
