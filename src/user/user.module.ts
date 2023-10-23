import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitMQModule, RabbitMQService } from 'src/libs/common/src';
import {
  AUTH_SERVICE,
  NOTIFICATION_SERVICE,
  SALESMAN_SERVICE,
} from './constants/service';
import { PrismaService } from 'src/prisma/service';
import { AccessTokenJwtStrategy } from 'src/strategies/access-token.jwt.strategy';

@Module({
  imports: [
    RabbitMQModule.register({
      name: SALESMAN_SERVICE,
    }),
    RabbitMQModule.register({
      name: AUTH_SERVICE,
    }),
    RabbitMQModule.register({
      name: NOTIFICATION_SERVICE,
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    RabbitMQService,
    PrismaService,
    AccessTokenJwtStrategy,
  ],
})
export class UserModule {}
