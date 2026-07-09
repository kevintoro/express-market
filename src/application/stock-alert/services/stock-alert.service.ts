import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';
import type { StockAlertFilters } from '../../../domain/product/ports/stock-alert.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { StockAlert } from '../../../domain/product/entities/stock-alert.entity';
import { StockAdjustedEvent } from '../../../domain/product/events/stock-adjusted.event';

@Injectable()
export class StockAlertService {
  constructor(
    private readonly alertRepo: StockAlertRepositoryPort,
    private readonly productRepo: ProductRepositoryPort,
  ) {}

  async findAll(filters?: StockAlertFilters): Promise<StockAlert[]> {
    return this.alertRepo.findAll(filters);
  }

  async findById(id: string): Promise<StockAlert | null> {
    return this.alertRepo.findById(id);
  }

  @OnEvent('stock.adjusted')
  async handleStockAdjusted(event: StockAdjustedEvent): Promise<void> {
    const product = await this.productRepo.findById(event.productId);
    if (!product) return;

    if (product.isLowStock) {
      const existingAlert = await this.alertRepo.findActiveByProductId(
        event.productId,
      );
      if (!existingAlert) {
          const alert = StockAlert.create(event.productId);
          await this.alertRepo.save(alert);
        }
    } else {
      const existingAlert = await this.alertRepo.findActiveByProductId(
        event.productId,
      );
      if (existingAlert) {
          existingAlert.resolve();
          await this.alertRepo.save(existingAlert);
        }
    }
  }
}
