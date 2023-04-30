import { Controller, Get, Inject, Post, UseGuards, Body, Query } from '@nestjs/common';
import { FilterDto } from 'src/dto/filter.dto';
import { FirebaseAuthGuard } from 'src/firebase/firebase.auth.guard';
import { Product } from 'src/schemas/product.schema';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService,
  ) { }

  @Get('/active')
  async getActiveProducts(@Query('animal') animal?: string): Promise<Product[]> {
    return await this.productsService.getActiveProducts(animal);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('/new')
  async createProduct(): Promise<any> {
    return await this.productsService.createTestProd();
  }

  @Post('/filter')
  async getFilterProducts(@Body() filterData: FilterDto): Promise<Product[]> {
    console.log(filterData)
    return await this.productsService.getFilteredProducts(filterData);
  }
}
