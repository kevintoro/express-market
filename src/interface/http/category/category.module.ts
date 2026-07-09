import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryController } from './category.controller';
import { CategoryService } from '../../../application/category/services/category.service';
import { CategoryRepositoryImpl } from '../../../infrastructure/database/typeorm/repositories/category.repository.impl';
import { CategoryOrmEntity } from '../../../infrastructure/database/typeorm/entities/category.orm-entity';
import { CategoryRepositoryPort } from '../../../domain/category/ports/category.repository.port';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity])],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    { provide: CategoryRepositoryPort, useClass: CategoryRepositoryImpl },
  ],
  exports: [CategoryService],
})
export class CategoryModule {}
