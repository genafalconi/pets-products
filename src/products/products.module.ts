import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Subproduct, SubproductSchema } from '../schemas/subprod.schema';
import { Lock, LockSchema } from 'src/schemas/lock.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Subproduct.name, schema: SubproductSchema },
      { name: Lock.name, schema: LockSchema }
    ]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
