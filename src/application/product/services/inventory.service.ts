import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { InventoryMovementRepositoryPort } from '../../../domain/product/ports/inventory-movement.repository.port';
import { ProductNotFoundException } from '../../../domain/product/exceptions/product-not-found.exception';
import { InventoryMovement } from '../../../domain/product/entities/inventory-movement.entity';
import { StockAdjustedEvent } from '../../../domain/product/events/stock-adjusted.event';

@Injectable()
export class InventoryService {
  constructor(
    private readonly productRepo: ProductRepositoryPort,
    private readonly movementRepo: InventoryMovementRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async adjustStock(
    productId: string,
    quantity: number,
    reason: string,
  ): Promise<{ product; movement }> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    const { previousStock, newStock } = product.adjustStock(quantity);
    const type = quantity >= 0 ? 'IN' : 'OUT';
    const movement = InventoryMovement.create(
      productId,
      type,
      Math.abs(quantity),
      reason,
    );

    await this.productRepo.save(product);
    const savedMovement = await this.movementRepo.save(movement);

    this.eventEmitter.emit(
      'stock.adjusted',
      new StockAdjustedEvent(
        productId,
        savedMovement.id,
        type,
        Math.abs(quantity),
        previousStock.value,
        newStock.value,
      ),
    );

    return { product, movement: savedMovement };
  }

  async getMovements(productId: string): Promise<InventoryMovement[]> {
    return this.movementRepo.findByProductId(productId);
  }
}
