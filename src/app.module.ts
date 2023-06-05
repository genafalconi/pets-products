import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './products/products.module';
import { SubproductsModule } from './subproducts/subproducts.module';
import { Connection } from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `env/${process.env.NODE_ENV || 'dev'}.env`,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGO_DB,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 30,
        retryAttempts: 2,
        retryDelay: 1000,
        connectionFactory: (connection: Connection) => {
          connection.plugin(require('mongoose-autopopulate'));
          return connection;
        }
      }),
    }),
    ProductsModule,
    SubproductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
