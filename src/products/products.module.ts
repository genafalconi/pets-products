import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SubproductsModule } from 'src/subproducts/subproducts.module';

@Module({
  imports: [
    SubproductsModule
  ],
  providers: [ProductsService],
  controllers: [ProductsController]
})
export class ProductsModule {}
