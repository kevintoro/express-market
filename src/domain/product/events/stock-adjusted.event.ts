import { DomainEvent } from '../../shared/domain-event.base';

export type AdjustmentType = 'IN' | 'OUT';

export class StockAdjustedEvent extends DomainEvent {
  constructor(
    public readonly productId: string,
    public readonly movementId: string,
    public readonly type: AdjustmentType,
    public readonly quantity: number,
    public readonly previousStock: number,
    public readonly newStock: number,
  ) {
    super();
  }
}
