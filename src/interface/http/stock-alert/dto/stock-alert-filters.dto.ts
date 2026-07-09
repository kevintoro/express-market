import { z } from 'zod';

export const StockAlertFiltersSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED']).optional(),
  productId: z.string().uuid().optional(),
});

export type StockAlertFiltersDto = z.infer<typeof StockAlertFiltersSchema>;
