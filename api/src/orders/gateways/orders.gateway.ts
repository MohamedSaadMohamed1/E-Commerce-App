import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '../enums/order-status.enum';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitOrderStatusUpdate(orderId: string, userId: string, status: OrderStatus) {
    this.server.emit('orderStatusUpdate', {
      orderId,
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Emitted order status update for order ${orderId}`);
  }
}
