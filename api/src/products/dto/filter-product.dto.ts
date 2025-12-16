import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductDto {
  @ApiProperty({
    description: 'Filter by category',
    example: 'Electronics',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Minimum price',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @ApiProperty({
    description: 'Maximum price',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({
    description: 'Filter by availability',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Search by name',
    example: 'laptop',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
