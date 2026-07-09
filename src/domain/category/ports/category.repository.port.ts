import { Category } from '../entities/category.entity';

export abstract class CategoryRepositoryPort {
  abstract save(category: Category): Promise<Category>;
  abstract findById(id: string): Promise<Category | null>;
  abstract findAll(): Promise<Category[]>;
  abstract findByName(name: string): Promise<Category | null>;
}
