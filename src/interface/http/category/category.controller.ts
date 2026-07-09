import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoryService } from '../../../application/category/services/category.service';
import { CreateCategorySchema } from './dto/create-category.dto';
import type { CreateCategoryDto } from './dto/create-category.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Category } from '../../../domain/category/entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateCategorySchema)) dto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoryService.create(dto.name, dto.description);
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }
}
