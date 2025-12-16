import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}
