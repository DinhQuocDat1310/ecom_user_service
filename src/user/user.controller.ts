import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDTO } from './dto/createUserDTO';
import { RabbitMQService } from 'src/libs/common/src';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly rmqService: RabbitMQService,
  ) {}

  @Post()
  async createOrder(@Body() user: CreateUserDTO) {
    return this.userService.createUser(user);
  }

  @EventPattern('salesman_created')
  async getSalesmanIdCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const user = await this.userService.updateSalesmanIdCreated(data);
    this.rmqService.ack(context);
    return user;
  }
}
