import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrderRepositoryPort } from '../../../../domain/product/ports/purchase-order.repository.port';
import type { PurchaseOrderFilters } from '../../../../domain/product/ports/purchase-order.repository.port';
import { PurchaseOrder } from '../../../../domain/product/entities/purchase-order.entity';
import { PurchaseOrderOrmEntity } from '../entities/purchase-order.orm-entity';
import { PurchaseOrderMapper } from '../mappers/purchase-order.mapper';

@Injectable()
export class PurchaseOrderRepositoryImpl extends PurchaseOrderRepositoryPort {
  constructor(
    @InjectRepository(PurchaseOrderOrmEntity)
    private readonly repo: Repository<PurchaseOrderOrmEntity>,
  ) {
    super();
  }

  async save(order: PurchaseOrder): Promise<PurchaseOrder> {
    const orm = PurchaseOrderMapper.toOrm(order);
    const saved = await this.repo.save(orm);
    return PurchaseOrderMapper.toDomain(saved);
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? PurchaseOrderMapper.toDomain(orm) : null;
  }

  async findAll(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.supplier) where.supplier = filters.supplier;

    const orms = await this.repo.find({ where, order: { createdAt: 'DESC' } });
    return orms.map(PurchaseOrderMapper.toDomain);
  }
}
