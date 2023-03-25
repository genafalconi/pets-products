import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { DocumentData } from 'firebase-admin/firestore';
import { FirebaseAuthGuard } from 'src/firebase/firebase.auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {

  constructor(
    @Inject(ProductsService)
    private readonly productsService: ProductsService
  ) { }

  @UseGuards(FirebaseAuthGuard)
  @Post('/')
  async createProductsFromExcel(): Promise<void> {
    return await this.productsService.createProduct()
  }

  @Get('/active')
  async getActiveProducts(): Promise<DocumentData> {
    return await this.productsService.getActiveProducts()
  }

}
