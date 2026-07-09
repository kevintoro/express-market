import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from '../../../application/product/services/product.service';
import { InventoryService } from '../../../application/product/services/inventory.service';
import { ProductRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/product.repository.impl';
import { InventoryMovementRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/inventory-movement.repository.impl';
import { ProductOrmEntity } from '../../../infrastructure/database/typeorm/entities/product.orm-entity';
import { InventoryMovementOrmEntity } from '../../../infrastructure/database/typeorm/entities/inventory-movement.orm-entity';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { InventoryMovementRepositoryPort } from '../../../domain/product/ports/inventory-movement.repository.port';
import { StockAlertModule } from '../stock-alert/stock-alert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductOrmEntity, InventoryMovementOrmEntity]),
    StockAlertModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    InventoryService,
    { provide: ProductRepositoryPort, useClass: ProductRepositoryImpl },
    {
      provide: InventoryMovementRepositoryPort,
      useClass: InventoryMovementRepositoryImpl,
    },
  ],
  exports: [ProductService, InventoryService],
})
export class ProductModule {}
