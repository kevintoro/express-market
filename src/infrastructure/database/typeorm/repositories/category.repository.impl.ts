import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryRepositoryPort } from '../../../../domain/category/ports/category.repository.port';
import { Category } from '../../../../domain/category/entities/category.entity';
import { CategoryOrmEntity } from '../entities/category.orm-entity';
import { CategoryMapper } from '../mappers/category.mapper';

@Injectable()
export class CategoryRepositoryImpl extends CategoryRepositoryPort {
  constructor(
    @InjectRepository(CategoryOrmEntity)
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {
    super();
  }

  async save(category: Category): Promise<Category> {
    const orm = CategoryMapper.toOrm(category);
    const saved = await this.repo.save(orm);
    return CategoryMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? CategoryMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Category[]> {
    const orms = await this.repo.find();
    return orms.map(CategoryMapper.toDomain);
  }

  async findByName(name: string): Promise<Category | null> {
    const orm = await this.repo.findOne({ where: { name } });
    return orm ? CategoryMapper.toDomain(orm) : null;
  }
}
