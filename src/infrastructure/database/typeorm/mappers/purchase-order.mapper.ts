import {
  PurchaseOrder,
  OrderStatus,
} from '../../../../domain/product/entities/purchase-order.entity';
import { PurchaseOrderOrmEntity } from '../entities/purchase-order.orm-entity';

export class PurchaseOrderMapper {
  static toDomain(orm: PurchaseOrderOrmEntity): PurchaseOrder {
    return new PurchaseOrder(
      {
        productId: orm.productId,
        supplier: orm.supplier,
        quantity: orm.quantity,
        status: orm.status as OrderStatus,
        rejectionReason: orm.rejectionReason,
        createdAt: orm.createdAt,
        updatedAt: orm.updatedAt,
      },
      orm.id,
    );
  }

  static toOrm(domain: PurchaseOrder): PurchaseOrderOrmEntity {
    const orm = new PurchaseOrderOrmEntity();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.supplier = domain.supplier;
    orm.quantity = domain.quantity;
    orm.status = domain.status;
    orm.rejectionReason = domain.rejectionReason;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
