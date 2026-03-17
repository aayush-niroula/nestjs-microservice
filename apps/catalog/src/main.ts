import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { CatalogModule } from "./catalog.module";



async function bootstrap() {
  process.title='catalog'
  const logger= new Logger('CatalogBootstrap')

  const rmqUrl= process.env.RABBITMQ_URL ?? "amqp://localhost:5672"

  const queue = process.env.CATALOG_QUEUE ?? "catalog_queue"


  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CatalogModule,
    {
      transport:Transport.RMQ,
      options:{
        urls:[rmqUrl],
        queue:queue,
        queueOptions:{
          durable:false
        }
      }
    },
    
  )

  app.enableShutdownHooks();
  await app.listen()
  logger.log(`Catalog RMQ listening on queue ${queue} via ${rmqUrl}`)
  
}

bootstrap()