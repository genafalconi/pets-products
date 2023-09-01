import {
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { FilterDto } from 'src/dto/filter.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.auth.guard';
import { Product } from 'src/schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductPaginationDto } from 'src/dto/productPagination.dto';
import { LandingType } from 'src/dto/types.dto';
import { Landing } from 'src/schemas/landing.schema';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) {}

  @Get('/active')
  async getActiveProducts(
    @Query('page') page: number,
  ): Promise<ProductPaginationDto> {
    return await this.productsService.getActiveProducts(page);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('/new')
  async createProduct(): Promise<any> {
    return await this.productsService.createTestProd();
  }

  @Get('/filter')
  async getFilterProducts(@Body() filterData: FilterDto): Promise<Product[]> {
    return await this.productsService.getFilteredProducts(filterData);
  }

  @Get('/search')
  async getSearchProducts(
    @Query('page') page: string,
    @Query('input') input?: string,
    @Query('animal') animal?: string,
  ): Promise<ProductPaginationDto> {
    return await this.productsService.getProductsByInputSearch(
      input,
      parseInt(page),
      animal,
    );
  }

  @Get('/search/movement')
  async getNonPaginateProducts(@Query('input') input: string): Promise<any> {
    return await this.productsService.getProductsMovementSearch(input);
  }

  @Get('/aca')
  async productsdoc() {
    return await this.productsService.createProds()
  }

  @Get('/landing-images')
  async getLandingImages(@Query('type') type?: LandingType): Promise<Landing[]> {
    return await this.productsService.getLandingImages(type)
  }
}
