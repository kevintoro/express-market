import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PurchaseOrderService } from '../../../application/purchase-order/services/purchase-order.service';
import { CreatePurchaseOrderSchema } from './dto/create-purchase-order.dto';
import type { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { RejectOrderSchema } from './dto/reject-order.dto';
import type { RejectOrderDto } from './dto/reject-order.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { PurchaseOrder } from '../../../domain/product/entities/purchase-order.entity';

@Controller('orders')
export class PurchaseOrderController {
  constructor(private readonly orderService: PurchaseOrderService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreatePurchaseOrderSchema))
    dto: CreatePurchaseOrderDto,
  ): Promise<PurchaseOrder> {
    return this.orderService.create(dto.productId, dto.quantity);
  }

  @Get()
  async findAll(): Promise<PurchaseOrder[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PurchaseOrder | null> {
    return this.orderService.findById(id);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.orderService.approve(id);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(RejectOrderSchema)) dto: RejectOrderDto,
  ): Promise<PurchaseOrder> {
    return this.orderService.reject(id, dto.reason);
  }

  @Patch(':id/receive')
  async receive(@Param('id') id: string): Promise<PurchaseOrder> {
    return this.orderService.receive(id);
  }
}
