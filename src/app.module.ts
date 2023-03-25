import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { SubproductsModule } from './subproducts/subproducts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV || 'dev'}.env`
    }),
    ProductsModule,
    SubproductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
