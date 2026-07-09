import { InventoryMovement } from '../entities/inventory-movement.entity';

export abstract class InventoryMovementRepositoryPort {
  abstract save(movement: InventoryMovement): Promise<InventoryMovement>;
  abstract findByProductId(productId: string): Promise<InventoryMovement[]>;
}
