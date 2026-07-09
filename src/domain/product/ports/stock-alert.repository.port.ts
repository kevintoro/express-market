import { StockAlert, AlertStatus } from '../entities/stock-alert.entity';

export interface StockAlertFilters {
  status?: AlertStatus;
  productId?: string;
}

export abstract class StockAlertRepositoryPort {
  abstract save(alert: StockAlert): Promise<StockAlert>;
  abstract findById(id: string): Promise<StockAlert | null>;
  abstract findActiveByProductId(productId: string): Promise<StockAlert | null>;
  abstract findAll(filters?: StockAlertFilters): Promise<StockAlert[]>;
}
