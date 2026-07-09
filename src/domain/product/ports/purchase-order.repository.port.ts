import { PurchaseOrder, OrderStatus } from '../entities/purchase-order.entity';

export interface PurchaseOrderFilters {
  status?: OrderStatus;
  productId?: string;
  supplier?: string;
}

export abstract class PurchaseOrderRepositoryPort {
  abstract save(order: PurchaseOrder): Promise<PurchaseOrder>;
  abstract findById(id: string): Promise<PurchaseOrder | null>;
  abstract findAll(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]>;
}
