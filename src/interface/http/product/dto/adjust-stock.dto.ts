import { z } from 'zod';

export const AdjustStockSchema = z.object({
  quantity: z
    .number()
    .int()
    .refine((v) => v !== 0, 'Quantity must not be zero'),
  reason: z.string().min(1).max(255),
});

export type AdjustStockDto = z.infer<typeof AdjustStockSchema>;
