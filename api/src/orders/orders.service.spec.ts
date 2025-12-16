import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';
import { OrdersGateway } from './gateways/orders.gateway';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
  };

  const mockEmailService = {
    sendOrderStatusUpdate: jest.fn(),
  };

  const mockOrdersGateway = {
    emitOrderStatusUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: OrdersGateway,
          useValue: mockOrdersGateway,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
