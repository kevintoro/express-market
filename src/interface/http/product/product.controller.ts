import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from '../../../application/product/services/product.service';
import { InventoryService } from '../../../application/product/services/inventory.service';
import { StockAlertService } from '../../../application/stock-alert/services/stock-alert.service';
import { CreateProductSchema } from './dto/create-product.dto';
import type { CreateProductDto } from './dto/create-product.dto';
import { AdjustStockSchema } from './dto/adjust-stock.dto';
import type { AdjustStockDto } from './dto/adjust-stock.dto';
import { ProductFiltersSchema } from './dto/product-filters.dto';
import type { ProductFiltersDto } from './dto/product-filters.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { Product } from '../../../domain/product/entities/product.entity';
import { InventoryMovement } from '../../../domain/product/entities/inventory-movement.entity';
import { StockAlert } from '../../../domain/product/entities/stock-alert.entity';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly inventoryService: InventoryService,
    private readonly alertService: StockAlertService,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateProductSchema)) dto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.register(
      dto.name,
      dto.sku,
      dto.categoryId,
      dto.price,
      dto.minStock,
      dto.supplier,
    );
  }

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(ProductFiltersSchema))
    filters: ProductFiltersDto,
  ): Promise<Product[]> {
    return this.productService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Product> {
    return this.productService.findById(id);
  }

  @Patch(':id/stock')
  async adjustStock(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AdjustStockSchema)) dto: AdjustStockDto,
  ): Promise<{ product: Product; movement: any }> {
    return this.inventoryService.adjustStock(id, dto.quantity, dto.reason);
  }

  @Get(':id/movements')
  async getMovements(@Param('id') id: string): Promise<InventoryMovement[]> {
    return this.inventoryService.getMovements(id);
  }

  @Get(':id/alerts')
  async getAlerts(@Param('id') id: string): Promise<StockAlert[]> {
    return this.alertService.findAll({ productId: id });
  }
}
