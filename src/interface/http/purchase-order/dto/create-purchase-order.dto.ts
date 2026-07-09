import { z } from 'zod';

export const CreatePurchaseOrderSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type CreatePurchaseOrderDto = z.infer<typeof CreatePurchaseOrderSchema>;
