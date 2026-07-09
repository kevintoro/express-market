import { Category } from '../../../../domain/category/entities/category.entity';
import { CategoryOrmEntity } from '../entities/category.orm-entity';

export class CategoryMapper {
  static toDomain(orm: CategoryOrmEntity): Category {
    return new Category(
      {
        name: orm.name,
        description: orm.description,
        isActive: orm.isActive,
      },
      orm.id,
    );
  }

  static toOrm(domain: Category): CategoryOrmEntity {
    const orm = new CategoryOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.description = domain.description;
    orm.isActive = domain.isActive;
    return orm;
  }
}
