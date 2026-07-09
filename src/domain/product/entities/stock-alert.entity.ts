import { Entity } from '../../shared/entity.base';

export type AlertType = 'STOCK_LOW';
export type AlertStatus = 'ACTIVE' | 'RESOLVED';

interface StockAlertProps {
  productId: string;
  type: AlertType;
  status: AlertStatus;
  triggeredAt: Date;
  resolvedAt?: Date;
}

export class StockAlert extends Entity<StockAlertProps> {
  constructor(props: StockAlertProps, id?: string) {
    super(props, id);
  }

  static create(productId: string): StockAlert {
    return new StockAlert({
      productId,
      type: 'STOCK_LOW',
      status: 'ACTIVE',
      triggeredAt: new Date(),
    });
  }

  get productId(): string {
    return this.props.productId;
  }

  get type(): AlertType {
    return this.props.type;
  }

  get status(): AlertStatus {
    return this.props.status;
  }

  get triggeredAt(): Date {
    return this.props.triggeredAt;
  }

  get resolvedAt(): Date | undefined {
    return this.props.resolvedAt;
  }

  resolve(): void {
    if (this.props.status === 'RESOLVED') {
      throw new Error('Alert is already resolved');
    }
    this.props.status = 'RESOLVED';
    this.props.resolvedAt = new Date();
  }
}
