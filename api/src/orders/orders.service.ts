import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';
import { OrdersGateway } from './gateways/orders.gateway';
import { User } from '../users/entities/user.entity';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly emailService: EmailService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order> {
    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);

      if (!product.isAvailable) {
        throw new BadRequestException(
          `Product ${product.name} is not available`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      const subtotal = Number(product.price) * item.quantity;
      total += subtotal;

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      userId: user.id,
      total,
      orderItems,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`Order ${savedOrder.id} created by user ${user.id}`);

    return savedOrder;
  }

  async findAll(user?: User): Promise<Order[]> {
    if (user) {
      return this.orderRepository.find({
        where: { userId: user.id },
        relations: ['user', 'orderItems', 'orderItems.product'],
        order: { createdAt: 'DESC' },
      });
    }

    return this.orderRepository.find({
      relations: ['user', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user?: User): Promise<Order> {
    const where: any = { id };
    if (user) {
      where.userId = user.id;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['user', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    this.validateStatusTransition(order.status, updateOrderStatusDto.status);

    order.status = updateOrderStatusDto.status;
    const updatedOrder = await this.orderRepository.save(order);

    this.ordersGateway.emitOrderStatusUpdate(
      updatedOrder.id,
      updatedOrder.userId,
      updatedOrder.status,
    );

    await this.emailService.sendOrderStatusUpdate(
      updatedOrder.user.email,
      updatedOrder.id,
      updatedOrder.status,
    );

    this.logger.log(`Order ${id} status updated to ${updatedOrder.status}`);

    return updatedOrder;
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
    };

    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
