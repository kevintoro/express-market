import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PurchaseOrderRepositoryPort } from '../../../domain/product/ports/purchase-order.repository.port';
import type { PurchaseOrderFilters } from '../../../domain/product/ports/purchase-order.repository.port';
import { ProductRepositoryPort } from '../../../domain/product/ports/product.repository.port';
import { StockAlertRepositoryPort } from '../../../domain/product/ports/stock-alert.repository.port';
import { PurchaseOrder } from '../../../domain/product/entities/purchase-order.entity';
import { ProductNotFoundException } from '../../../domain/product/exceptions/product-not-found.exception';
import { OrderNotFoundException } from '../../../domain/product/exceptions/order-not-found.exception';
import { StockAdjustedEvent } from '../../../domain/product/events/stock-adjusted.event';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private readonly orderRepo: PurchaseOrderRepositoryPort,
    private readonly productRepo: ProductRepositoryPort,
    private readonly alertRepo: StockAlertRepositoryPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(productId: string, quantity: number): Promise<PurchaseOrder> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    const order = PurchaseOrder.create(
      productId,
      product.supplier,
      quantity,
      product.minimumOrderQuantity,
    );
    return this.orderRepo.save(order);
  }

  async findAll(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> {
    return this.orderRepo.findAll(filters);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    return this.orderRepo.findById(id);
  }

  async approve(id: string): Promise<PurchaseOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }

    order.approve();
    return this.orderRepo.save(order);
  }

  async reject(id: string, reason: string): Promise<PurchaseOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }

    order.reject(reason);
    return this.orderRepo.save(order);
  }

  async receive(id: string): Promise<PurchaseOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) {
      throw new OrderNotFoundException(id);
    }

    const product = await this.productRepo.findById(order.productId);
    if (!product) {
      throw new ProductNotFoundException(order.productId);
    }

    order.receive();
    product.adjustStock(order.quantity);

    await this.productRepo.save(product);
    const saved = await this.orderRepo.save(order);

    this.eventEmitter.emit(
      'stock.adjusted',
      new StockAdjustedEvent(
        product.id,
        id,
        'IN',
        order.quantity,
        product.stockValue - order.quantity,
        product.stockValue,
      ),
    );

    return saved;
  }
}
