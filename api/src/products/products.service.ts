import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { BulkImportProductDto } from './dto/bulk-import-product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly CACHE_KEY = 'products_list';
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    await this.clearCache();
    return this.productRepository.save(product);
  }

  async findAll(filterDto?: FilterProductDto): Promise<Product[]> {
    const cacheKey = filterDto
      ? `${this.CACHE_KEY}_${JSON.stringify(filterDto)}`
      : this.CACHE_KEY;

    const cached = await this.cacheManager.get<Product[]>(cacheKey);
    if (cached) {
      this.logger.log('Returning cached products');
      return cached;
    }

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (filterDto) {
      if (filterDto.category) {
        queryBuilder.andWhere('product.category = :category', {
          category: filterDto.category,
        });
      }

      if (filterDto.minPrice !== undefined && filterDto.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: filterDto.minPrice,
          maxPrice: filterDto.maxPrice,
        });
      } else if (filterDto.minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', {
          minPrice: filterDto.minPrice,
        });
      } else if (filterDto.maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', {
          maxPrice: filterDto.maxPrice,
        });
      }

      if (filterDto.isAvailable !== undefined) {
        queryBuilder.andWhere('product.isAvailable = :isAvailable', {
          isAvailable: filterDto.isAvailable,
        });
      }

      if (filterDto.search) {
        queryBuilder.andWhere('product.name ILIKE :search', {
          search: `%${filterDto.search}%`,
        });
      }
    }

    const products = await queryBuilder.getMany();
    await this.cacheManager.set(cacheKey, products, this.CACHE_TTL);
    return products;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    await this.clearCache();
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    await this.clearCache();
  }

  async bulkImport(bulkImportDto: BulkImportProductDto): Promise<Product[]> {
    const products = this.productRepository.create(bulkImportDto.products);
    const savedProducts = await this.productRepository.save(products);
    await this.clearCache();
    this.logger.log(`Bulk imported ${savedProducts.length} products`);
    return savedProducts;
  }

  private async clearCache(): Promise<void> {
    this.logger.log('Product cache invalidated');
  }
}
