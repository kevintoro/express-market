import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from '../../../application/purchase-order/services/purchase-order.service';
import { PurchaseOrderRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/purchase-order.repository.impl';
import { ProductRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/product.repository.impl';
import { StockAlertRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/stock-alert.repository.impl';
import { PurchaseOrderOrmEntity } from '../../../infrastructure/database/typeorm/entities/purchase-order.orm-entity';
import { ProductOrmEntity } from '../../../infrastructure/database/typeorm/entities/product.orm-entity';
import { StockAlertOrmEntity } from '../../../infrastructure/database/typeorm/entities/stock-alert.orm-entity';
import { PurchaseOrderRepositoryPort } from '../../../domain/product/ports/purchase-order.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrderOrmEntity,
      ProductOrmEntity,
      StockAlertOrmEntity,
    ]),
  ],
  controllers: [PurchaseOrderController],
  providers: [
    PurchaseOrderService,
    {
      provide: PurchaseOrderRepositoryPort,
      useClass: PurchaseOrderRepositoryImpl,
    },
    { provide: ProductRepositoryPort, useClass: ProductRepositoryImpl },
    { provide: StockAlertRepositoryPort, useClass: StockAlertRepositoryImpl },
  ],
})
export class PurchaseOrderModule {}
