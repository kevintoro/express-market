import {
  StockAlert,
  AlertType,
  AlertStatus,
} from '../../../../domain/product/entities/stock-alert.entity';
import { StockAlertOrmEntity } from '../entities/stock-alert.orm-entity';

export class StockAlertMapper {
  static toDomain(orm: StockAlertOrmEntity): StockAlert {
    return new StockAlert(
      {
        productId: orm.productId,
        type: orm.type as AlertType,
        status: orm.status as AlertStatus,
        triggeredAt: orm.triggeredAt,
        resolvedAt: orm.resolvedAt,
      },
      orm.id,
    );
  }

  static toOrm(domain: StockAlert): StockAlertOrmEntity {
    const orm = new StockAlertOrmEntity();
    orm.id = domain.id;
    orm.productId = domain.productId;
    orm.type = domain.type;
    orm.status = domain.status;
    orm.triggeredAt = domain.triggeredAt;
    orm.resolvedAt = domain.resolvedAt;
    return orm;
  }
}
