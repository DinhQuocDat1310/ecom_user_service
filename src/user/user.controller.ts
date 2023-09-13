import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO, LoginUserDTO, Tokens } from './dto/createUserDTO';
import { RabbitMQService } from 'src/libs/common/src';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() user: CreateUserDTO): Promise<Tokens> {
    return this.userService.createUser(user);
  }

  @EventPattern('salesman_created')
  async getSalesmanIdCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.userService.updateSalesmanIdCreated(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('check_validate_user')
  async checkValidateUser(
    @Payload() data: LoginUserDTO,
    @Ctx() context: RmqContext,
  ) {
    const user = await this.userService.checkValidateUser(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('find_user_by_email_or_phone')
  async findUserByEmailOrPhoneNumber(
    @Payload() data: string,
    @Ctx() context: RmqContext,
  ) {
    const user: User = await this.userService.findUserByEmailOrPhoneNumber(
      data,
    );
    this.rmqService.ack(context);
    return user;
  }
}
