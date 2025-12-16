import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { ProductsService } from '../../products/products.service';
import { UserRole } from '../../users/enums/user-role.enum';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('DatabaseSeeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const usersService = app.get(UsersService);
    const productsService = app.get(ProductsService);

    logger.log('Starting database seeding...');

    const adminEmail = 'admin@ecommerce.com';
    const existingAdmin = await usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      await usersService.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'Admin123!',
        role: UserRole.ADMIN,
      });
      logger.log('Admin user created');
    } else {
      logger.log('Admin user already exists');
    }

    const customerEmail = 'customer@example.com';
    const existingCustomer = await usersService.findByEmail(customerEmail);

    if (!existingCustomer) {
      await usersService.create({
        name: 'John Doe',
        email: customerEmail,
        password: 'Customer123!',
        role: UserRole.CUSTOMER,
      });
      logger.log('Customer user created');
    } else {
      logger.log('Customer user already exists');
    }

    const sampleProducts = [
      {
        name: 'Laptop Pro 15',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 1299.99,
        category: 'Electronics',
        stock: 50,
        isAvailable: true,
        imageUrl: 'https://example.com/laptop.jpg',
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 29.99,
        category: 'Electronics',
        stock: 200,
        isAvailable: true,
        imageUrl: 'https://example.com/mouse.jpg',
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with Cherry MX switches',
        price: 149.99,
        category: 'Electronics',
        stock: 75,
        isAvailable: true,
        imageUrl: 'https://example.com/keyboard.jpg',
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader',
        price: 49.99,
        category: 'Electronics',
        stock: 150,
        isAvailable: true,
        imageUrl: 'https://example.com/hub.jpg',
      },
      {
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with 30-hour battery',
        price: 199.99,
        category: 'Electronics',
        stock: 100,
        isAvailable: true,
        imageUrl: 'https://example.com/headphones.jpg',
      },
      {
        name: 'Portable SSD 1TB',
        description: 'Ultra-fast portable SSD with 1TB storage',
        price: 129.99,
        category: 'Electronics',
        stock: 80,
        isAvailable: true,
        imageUrl: 'https://example.com/ssd.jpg',
      },
      {
        name: 'Webcam HD',
        description: '1080p HD webcam with built-in microphone',
        price: 79.99,
        category: 'Electronics',
        stock: 120,
        isAvailable: true,
        imageUrl: 'https://example.com/webcam.jpg',
      },
      {
        name: 'Monitor 27 inch',
        description: '27-inch 4K monitor with IPS panel',
        price: 399.99,
        category: 'Electronics',
        stock: 40,
        isAvailable: true,
        imageUrl: 'https://example.com/monitor.jpg',
      },
      {
        name: 'Office Chair',
        description: 'Ergonomic office chair with lumbar support',
        price: 249.99,
        category: 'Furniture',
        stock: 30,
        isAvailable: true,
        imageUrl: 'https://example.com/chair.jpg',
      },
      {
        name: 'Standing Desk',
        description: 'Adjustable standing desk with electric motor',
        price: 499.99,
        category: 'Furniture',
        stock: 20,
        isAvailable: true,
        imageUrl: 'https://example.com/desk.jpg',
      },
    ];

    for (const productData of sampleProducts) {
      await productsService.create(productData);
    }

    logger.log(`Seeded ${sampleProducts.length} products`);
    logger.log('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();
