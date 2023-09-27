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
import { ProductsService } from './products.service';
import { ProductPaginationDto } from 'src/dto/productPagination.dto';
import { LandingType } from 'src/dto/types.dto';
import { Landing } from 'src/schemas/landing.schema';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) { }

  @UseGuards(FirebaseAuthGuard)
  @Post('/new')
  async createProduct(): Promise<any> {
    return await this.productsService.createTestProd();
  }

  @Get('/')
  async getFilterProducts(@Query() filterData: FilterDto): Promise<ProductPaginationDto> {
    return await this.productsService.getFilteredProducts(filterData);
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
