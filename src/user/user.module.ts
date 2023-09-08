import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitMQModule, RabbitMQService } from 'src/libs/common/src';
import { AUTH_SERVICE, SALESMAN_SERVICE } from './constants/service';
import { PrismaService } from 'src/prisma/service';

@Module({
  imports: [
    RabbitMQModule.register({
      name: SALESMAN_SERVICE,
    }),
    RabbitMQModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, RabbitMQService, PrismaService],
})
export class UserModule {}
