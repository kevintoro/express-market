import { Entity } from '../../shared/entity.base';
import { InvalidOrderStateException } from '../exceptions/invalid-order-state.exception';
import { InvalidOrderQuantityException } from '../exceptions/invalid-order-quantity.exception';

export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RECEIVED';

interface PurchaseOrderProps {
  productId: string;
  supplier: string;
  quantity: number;
  status: OrderStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseOrder extends Entity<PurchaseOrderProps> {
  constructor(props: PurchaseOrderProps, id?: string) {
    super(props, id);
  }

  static create(
    productId: string,
    supplier: string,
    quantity: number,
    minimumQuantityRequired: number,
  ): PurchaseOrder {
    if (quantity < minimumQuantityRequired) {
      throw new InvalidOrderQuantityException(
        quantity,
        minimumQuantityRequired,
      );
    }

    return new PurchaseOrder({
      productId,
      supplier,
      quantity,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  get supplier(): string {
    return this.props.supplier;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  approve(): void {
    if (this.props.status !== 'PENDING') {
      throw new InvalidOrderStateException(this.props.status, 'APROBADA');
    }
    this.props.status = 'APPROVED';
    this.props.updatedAt = new Date();
  }

  reject(reason: string): void {
    if (this.props.status !== 'PENDING') {
      throw new InvalidOrderStateException(this.props.status, 'RECHAZADA');
    }
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }
    this.props.status = 'REJECTED';
    this.props.rejectionReason = reason;
    this.props.updatedAt = new Date();
  }

  receive(): void {
    if (this.props.status !== 'APPROVED') {
      throw new InvalidOrderStateException(this.props.status, 'RECIBIDA');
    }
    this.props.status = 'RECEIVED';
    this.props.updatedAt = new Date();
  }
}
