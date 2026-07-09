import { Entity } from '../../shared/entity.base';

export type MovementType = 'IN' | 'OUT';

interface InventoryMovementProps {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  createdAt: Date;
}

export class InventoryMovement extends Entity<InventoryMovementProps> {
  constructor(props: InventoryMovementProps, id?: string) {
    super(props, id);
  }

  static create(
    productId: string,
    type: MovementType,
    quantity: number,
    reason: string,
  ): InventoryMovement {
    return new InventoryMovement({
      productId,
      type,
      quantity,
      reason,
      createdAt: new Date(),
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get reason(): string {
    return this.props.reason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
