import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepositoryPort } from '../../../../domain/product/ports/product.repository.port';
import type { ProductFilters } from '../../../../domain/product/ports/product.repository.port';
import { Product } from '../../../../domain/product/entities/product.entity';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepositoryImpl extends ProductRepositoryPort {
  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repo: Repository<ProductOrmEntity>,
  ) {
    super();
  }

  async save(product: Product): Promise<Product> {
    const orm = ProductMapper.toOrm(product);
    const saved = await this.repo.save(orm);
    return ProductMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Product | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const orm = await this.repo.findOne({ where: { sku } });
    return orm ? ProductMapper.toDomain(orm) : null;
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    const query = this.repo.createQueryBuilder('p');

    if (filters?.categoryId) {
      query.andWhere('p.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }
    if (filters?.supplier) {
      query.andWhere('p.supplier = :supplier', { supplier: filters.supplier });
    }
    if (filters?.stockMin !== undefined) {
      query.andWhere('p.stock >= :stockMin', { stockMin: filters.stockMin });
    }
    if (filters?.stockMax !== undefined) {
      query.andWhere('p.stock <= :stockMax', { stockMax: filters.stockMax });
    }
    if (filters?.hasActiveAlert !== undefined) {
      if (filters.hasActiveAlert) {
        query.innerJoin(
          'stock_alerts',
          'sa',
          'sa.productId = p.id AND sa.status = :status',
          { status: 'ACTIVE' },
        );
      }
    }

    const orms = await query.getMany();
    return orms.map(ProductMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
