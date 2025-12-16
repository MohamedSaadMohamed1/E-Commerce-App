import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendOrderStatusUpdate(
    email: string,
    orderId: string,
    status: OrderStatus,
  ): Promise<void> {
    try {
      const statusMessages = {
        [OrderStatus.PENDING]: 'Your order has been received and is pending confirmation.',
        [OrderStatus.PROCESSING]: 'Your order is being processed.',
        [OrderStatus.SHIPPED]: 'Your order has been shipped!',
        [OrderStatus.DELIVERED]: 'Your order has been delivered!',
      };

      await this.transporter.sendMail({
        from: this.configService.get<string>('MAIL_FROM'),
        to: email,
        subject: `Order ${orderId} - Status Update`,
        html: `
          <h2>Order Status Update</h2>
          <p>Your order <strong>${orderId}</strong> status has been updated to: <strong>${status}</strong></p>
          <p>${statusMessages[status]}</p>
          <p>Thank you for your business!</p>
        `,
      });

      this.logger.log(`Order status email sent to ${email} for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error);
    }
  }
}
