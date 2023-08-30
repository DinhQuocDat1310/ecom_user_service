import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RabbitMQService } from 'src/libs/common/src';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // validationSchema: Joi.object({
      //   RABBIT_MQ_URI: Joi.string().required(),
      //   RABBIT_MQ_USER_QUEUE: Joi.string().required(),
      // }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService, RabbitMQService],
})
export class UserModule {}
