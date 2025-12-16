import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Laptop',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance laptop with 16GB RAM',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Product price',
    example: 999.99,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Electronics',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({
    description: 'Product availability',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/laptop.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
