import {
  InventoryMovement,
  MovementType,
} from '../../../../domain/product/entities/inventory-movement.entity';
import { InventoryMovementOrmEntity } from '../entities/inventory-movement.orm-entity';

export class InventoryMovementMapper {
  static toDomain(orm: InventoryMovementOrmEntity): InventoryMovement {
    return new InventoryMovement(
      {
        productId: orm.productId,
        type: orm.type as MovementType,
        quantity: orm.quantity,
        reason: orm.reason,
        createdAt: orm.createdAt,
      },
      orm.id,
    );
  }

  static toOrm(domain: InventoryMovement): InventoryMovementOrmEntity {
    const orm = new InventoryMovementOrmEntity();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.type = domain.type;
    orm.quantity = domain.quantity;
    orm.reason = domain.reason;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
