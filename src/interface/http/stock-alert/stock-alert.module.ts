import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertService } from '../../../application/stock-alert/services/stock-alert.service';
import { StockAlertRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/stock-alert.repository.impl';
import { ProductRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/product.repository.impl';
import { StockAlertOrmEntity } from '../../../infrastructure/database/typeorm/entities/stock-alert.orm-entity';
import { ProductOrmEntity } from '../../../infrastructure/database/typeorm/entities/product.orm-entity';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([StockAlertOrmEntity, ProductOrmEntity])],
  controllers: [StockAlertController],
  providers: [
    StockAlertService,
    { provide: StockAlertRepositoryPort, useClass: StockAlertRepositoryImpl },
    { provide: ProductRepositoryPort, useClass: ProductRepositoryImpl },
  ],
})
export class StockAlertModule {}
