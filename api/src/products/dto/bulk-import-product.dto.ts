import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

export class BulkImportProductDto {
  @ApiProperty({
    description: 'Array of products to import',
    type: [CreateProductDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  products: CreateProductDto[];
}
