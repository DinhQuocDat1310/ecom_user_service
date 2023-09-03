import {
  Injectable,
  Inject,
  InternalServerErrorException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  MESSAGE_CREATED_USER,
  MESSAGE_EXISTED_EMAIL,
  MESSAGE_EXISTED_PHONE,
  SALESMAN_SERVICE,
} from './constants/service';
import { PrismaService } from 'src/prisma/service';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDTO,
  FormatDataUser,
  MessageCreateUser,
} from './dto/createUserDTO';
import { lastValueFrom } from 'rxjs';
import { hash } from 'bcrypt';
import { Role, User } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(SALESMAN_SERVICE) private readonly salesmanClient: ClientProxy,
  ) {}

  createUser = async (dto: CreateUserDTO): Promise<MessageCreateUser> => {
    const { email, password, phoneNumber, dateOfBirth }: CreateUserDTO = dto;
    await this.checkEmailUser(email, MESSAGE_EXISTED_EMAIL);
    await this.checkPhoneNumberUser(phoneNumber, MESSAGE_EXISTED_PHONE);
    try {
      const hashPassword: string = await hash(password, 10);
      const data: FormatDataUser = {
        ...dto,
        password: hashPassword,
        dateOfBirth: moment(dateOfBirth, 'DD/MM/YYYY').toDate(),
      };
      const user: User = await this.prismaService.user.create({
        data,
      });
      // Send message to salesman-microservice or purchaser-microservice to notify them we created a user
      if (user.role === Role.SALESMAN)
        await lastValueFrom(this.salesmanClient.emit('user_created', user));
      if (user.role === Role.PURCHASER)
        await lastValueFrom(this.salesmanClient.emit('user_created', user));
      return {
        status: HttpStatus.CREATED,
        message: MESSAGE_CREATED_USER,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  checkEmailUser = async (email: string, message: string) => {
    const user: User = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (user) throw new BadRequestException(message);
  };

  checkPhoneNumberUser = async (phoneNumber: string, message: string) => {
    const user: User = await this.prismaService.user.findFirst({
      where: {
        phoneNumber,
      },
    });
    if (user) throw new BadRequestException(message);
  };

  updateSalesmanIdCreated = async (data: any) => {
    const userExistedForSalesman: User =
      await this.prismaService.user.findUnique({
        where: {
          id: data.userId,
        },
      });
    if (userExistedForSalesman)
      return await this.prismaService.user.update({
        data: {
          salesmanId: data.id,
        },
        where: {
          id: data.userId,
        },
      });
  };
}
