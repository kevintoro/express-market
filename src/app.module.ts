import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './infrastructure/database/database.module';
import { validateEnv } from './infrastructure/config/env.config';
import { CategoryModule } from './interface/http/category/category.module';
import { ProductModule } from './interface/http/product/product.module';
import { StockAlertModule } from './interface/http/stock-alert/stock-alert.module';
import { PurchaseOrderModule } from './interface/http/purchase-order/purchase-order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    DatabaseModule,
    CategoryModule,
    ProductModule,
    StockAlertModule,
    PurchaseOrderModule,
  ],
})
export class AppModule {}
