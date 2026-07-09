import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockAlertRepositoryPort } from '../../../../domain/product/ports/stock-alert.repository.port';
import type { StockAlertFilters } from '../../../../domain/product/ports/stock-alert.repository.port';
import { StockAlert } from '../../../../domain/product/entities/stock-alert.entity';
import { StockAlertOrmEntity } from '../entities/stock-alert.orm-entity';
import { StockAlertMapper } from '../mappers/stock-alert.mapper';

@Injectable()
export class StockAlertRepositoryImpl extends StockAlertRepositoryPort {
  constructor(
    @InjectRepository(StockAlertOrmEntity)
    private readonly repo: Repository<StockAlertOrmEntity>,
  ) {
    super();
  }

  async save(alert: StockAlert): Promise<StockAlert> {
    const orm = StockAlertMapper.toOrm(alert);
    const saved = await this.repo.save(orm);
    return StockAlertMapper.toDomain(saved);
  }

  async findById(id: string): Promise<StockAlert | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? StockAlertMapper.toDomain(orm) : null;
  }

  async findActiveByProductId(productId: string): Promise<StockAlert | null> {
    const orm = await this.repo.findOne({
      where: { productId, status: 'ACTIVE' },
    });
    return orm ? StockAlertMapper.toDomain(orm) : null;
  }

  async findAll(filters?: StockAlertFilters): Promise<StockAlert[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.productId) where.productId = filters.productId;

    const orms = await this.repo.find({
      where,
      order: { triggeredAt: 'DESC' },
    });
    return orms.map(StockAlertMapper.toDomain);
  }
}
