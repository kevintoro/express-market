import { Controller, Get, Param, Query } from '@nestjs/common';
import { StockAlertService } from '../../../application/stock-alert/services/stock-alert.service';
import { StockAlertFiltersSchema } from './dto/stock-alert-filters.dto';
import type { StockAlertFiltersDto } from './dto/stock-alert-filters.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { StockAlert } from '../../../domain/product/entities/stock-alert.entity';

@Controller('alerts')
export class StockAlertController {
  constructor(private readonly alertService: StockAlertService) {}

  @Get()
  async findAll(
    @Query(new ZodValidationPipe(StockAlertFiltersSchema))
    filters: StockAlertFiltersDto,
  ): Promise<StockAlert[]> {
    return this.alertService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<StockAlert | null> {
    return this.alertService.findById(id);
  }
}
