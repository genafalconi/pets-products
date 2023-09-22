import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { SubproductsModule } from './subproducts/subproducts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV || 'dev'}.env`,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGO_DB'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        autoIndex: false,
        poolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        keepAlive: true,
        keepAliveInitialDelay: 300000,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    SubproductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
