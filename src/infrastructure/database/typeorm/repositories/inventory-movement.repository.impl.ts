import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovementRepositoryPort } from '../../../../domain/product/ports/inventory-movement.repository.port';
import { InventoryMovement } from '../../../../domain/product/entities/inventory-movement.entity';
import { InventoryMovementOrmEntity } from '../entities/inventory-movement.orm-entity';
import { InventoryMovementMapper } from '../mappers/inventory-movement.mapper';

@Injectable()
export class InventoryMovementRepositoryImpl extends InventoryMovementRepositoryPort {
  constructor(
    @InjectRepository(InventoryMovementOrmEntity)
    private readonly repo: Repository<InventoryMovementOrmEntity>,
  ) {
    super();
  }

  async save(movement: InventoryMovement): Promise<InventoryMovement> {
    const orm = InventoryMovementMapper.toOrm(movement);
    const saved = await this.repo.save(orm);
    return InventoryMovementMapper.toDomain(saved);
  }

  async findByProductId(productId: string): Promise<InventoryMovement[]> {
    const orms = await this.repo.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(InventoryMovementMapper.toDomain);
  }
}
