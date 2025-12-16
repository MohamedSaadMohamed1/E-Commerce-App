import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersGateway } from './gateways/orders.gateway';
import { ProductsModule } from '../products/products.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    EmailModule,
  ],
  providers: [OrdersService, OrdersGateway],
  controllers: [OrdersController],
})
export class OrdersModule {}
