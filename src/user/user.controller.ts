import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDTO,
  LoginUserDTO,
  NotificationDTO,
  RequestUser,
  Tokens,
  UpdateProfileDTO,
} from './dto/createUserDTO';
import { RabbitMQService } from 'src/libs/common/src';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { User } from '@prisma/client';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AccessJwtAuthGuard } from 'src/guards/jwt-access-auth.guard';

@Controller('user')
@ApiTags('User')
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

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiBody({ type: UpdateProfileDTO })
  @UseGuards(AccessJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/update/:id')
  @ApiOperation({ summary: 'Update profile' })
  async updateUserProfile(
    @Request() req: RequestUser,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ) {
    return await this.userService.updateProfile(req.user.id, updateProfileDTO);
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

  @MessagePattern('create_user_login_google')
  async createUserLoginWithGoogle(
    @Payload() data: LoginUserDTO,
    @Ctx() context: RmqContext,
  ) {
    const user = await this.userService.createUserLoginWithGoogle(data);
    this.rmqService.ack(context);
    return user;
  }

  @MessagePattern('verify_email_with_otp')
  async updateVerifyStatusUser(
    @Payload() data: string,
    @Ctx() context: RmqContext,
  ) {
    const user = await this.userService.updateVerifyStatusUser(data);
    this.rmqService.ack(context);
    return user;
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiBody({ type: NotificationDTO })
  @UseGuards(AccessJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/notification/enable')
  @ApiOperation({ summary: 'Turn on Notification' })
  async enableNotification(
    @Request() req: RequestUser,
    @Body() notificationDTO: NotificationDTO,
  ) {
    return await this.userService.enableNotification(req.user, notificationDTO);
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @ApiBody({ type: NotificationDTO })
  @UseGuards(AccessJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('/notification/disable')
  @ApiOperation({ summary: 'Turn off Notification' })
  async disableNotification(
    @Request() req: RequestUser,
    @Body() notificationDTO: NotificationDTO,
  ) {
    return await this.userService.disableNotification(
      req.user,
      notificationDTO,
    );
  }

  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiOkResponse({ description: 'Ok' })
  @UseGuards(AccessJwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('/notification/disable')
  @ApiOperation({ summary: 'Get all Notification' })
  async getAllNotification(@Request() req: RequestUser) {
    return await this.userService.getAllNotifications(req.user);
  }
}
