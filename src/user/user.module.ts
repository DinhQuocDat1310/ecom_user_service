import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitMQModule, RabbitMQService } from 'src/libs/common/src';
import { ConfigModule } from '@nestjs/config';
import { SALESMAN_SERVICE } from './constants/service';
import { PrismaService } from 'src/prisma/service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.rabbitmq',
    }),
    RabbitMQModule.register({
      name: SALESMAN_SERVICE,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RabbitMQService, PrismaService],
})
export class UserModule {}
