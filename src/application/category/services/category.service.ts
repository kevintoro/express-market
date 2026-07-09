import { Injectable } from '@nestjs/common';
import { CategoryRepositoryPort } from '../../../domain/category/ports/category.repository.port';
import { Category } from '../../../domain/category/entities/category.entity';
import { CategoryNotFoundException } from '../../../domain/category/exceptions/category-not-found.exception';
import { DuplicateCategoryException } from '../../../domain/category/exceptions/duplicate-category.exception';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepositoryPort) {}

  async create(name: string, description?: string): Promise<Category> {
    const existing = await this.categoryRepo.findByName(name);
    if (existing) {
      throw new DuplicateCategoryException(name);
    }

    const category = Category.create(name, description);
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }
}
