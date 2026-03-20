import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductHttpController } from './products/product.controlller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL as string),

    UserModule,
    AuthModule,


    ClientsModule.register([
      {
        name:'CATALOG_CLIENT',
        transport:Transport.RMQ,
        options:{
          urls:[process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue:process.env.CATALOG_QUEUE ?? "catalog_queue",
          queueOptions:{
            durable:false
          }
        }
      },
      {
        name:'MEDIA_CLIENT',
        transport:Transport.RMQ,
        options:{
          urls:[process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue:process.env.MEDIA_QUEUE ?? "media_queue",
          queueOptions:{
            durable:false
          }
        }
      },
      {
        name:'SEARCH_CLIENT',
        transport:Transport.RMQ,
        options:{
          urls:[process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
          queue:process.env.SEARCH_QUEUE ?? "search_queue",
          queueOptions:{
            durable:false
          }
        }
      },
    ])
  ],
  controllers: [GatewayController,ProductHttpController],
  providers: [GatewayService],
})
export class GatewayModule {}
