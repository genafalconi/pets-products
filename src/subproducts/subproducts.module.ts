import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lock, LockSchema } from '../schemas/lock.schema';
import { Subproduct, SubproductSchema } from '../schemas/subprod.schema';
import { SubproductsController } from './subproducts.controller';
import { SubproductsService } from './subproducts.service';

@Module({
  imports: [
    SubproductsModule,
    MongooseModule.forFeature([
      { name: Lock.name, schema: LockSchema },
      { name: Subproduct.name, schema: SubproductSchema },
    ]),
  ],
  controllers: [SubproductsController],
  providers: [SubproductsService],
  exports: [SubproductsService],
})
export class SubproductsModule {}
