import {
  Injectable,
  Inject,
  InternalServerErrorException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import {
  AUTH_SERVICE,
  GOOGLE_PROVIDER,
  MESSAGE_EXISTED_EMAIL,
  MESSAGE_EXISTED_PHONE,
  NOTIFICATION_SERVICE,
  NOTIFICATION_UPDATED_USER,
  SALESMAN_SERVICE,
} from './constants/service';
import { PrismaService } from 'src/prisma/service';
import { ClientProxy } from '@nestjs/microservices';
import {
  CreateUserDTO,
  FormatDataUser,
  LoginUserDTO,
  NotificationDTO,
  Tokens,
  UpdateProfileDTO,
  UserSignIn,
} from './dto/createUserDTO';
import { lastValueFrom } from 'rxjs';
import { hash, compare } from 'bcrypt';
import { Role, User } from '@prisma/client';
import * as moment from 'moment';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(SALESMAN_SERVICE) private readonly salesmanClient: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(NOTIFICATION_SERVICE)
    private readonly notificationClient: ClientProxy,
  ) {}

  createUser = async (dto: CreateUserDTO): Promise<Tokens> => {
    const {
      email,
      password,
      phoneNumber,
      dateOfBirth,
      provider,
    }: CreateUserDTO = dto;
    await this.checkEmailUser(email, MESSAGE_EXISTED_EMAIL);
    await this.checkPhoneNumberUser(phoneNumber, MESSAGE_EXISTED_PHONE);
    const data: FormatDataUser = {
      ...dto,
      dateOfBirth: dateOfBirth
        ? moment(dateOfBirth, 'DD/MM/YYYY').toDate()
        : null,
    };
    provider === GOOGLE_PROVIDER
      ? (data['password'] = null)
      : (data['password'] = await hash(password, 10));
    try {
      const user: User = await this.prismaService.user.create({
        data,
      });
      // Send message to salesman-microservice or purchaser-microservice to notify them we created a user
      if (user.role === Role.SALESMAN)
        await lastValueFrom(this.salesmanClient.emit('user_created', user));
      if (user.role === Role.PURCHASER)
        await lastValueFrom(this.salesmanClient.emit('user_created', user));
      // Send message to auth-microservice to notify them we created a user and need to token
      const tokens = await lastValueFrom(
        this.authClient.send('generate_token_user', user),
      );
      if (tokens) {
        user['hashedRefreshToken'] = tokens.refreshToken;
      }
      if (user['password']) delete user['password'];
      // Send message to auth-microservice to notify them we created a user => Need save user and token
      await lastValueFrom(this.authClient.emit('save_user_with_token', user));
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  createUserLoginWithGoogle = async (data: any) => {
    return await this.createUser(data);
  };

  checkEmailUser = async (email: string, message: string) => {
    if (email) {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (user) throw new BadRequestException(message);
    }
  };

  checkPhoneNumberUser = async (phoneNumber: string, message: string) => {
    if (phoneNumber) {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          phoneNumber,
        },
      });
      if (user) throw new BadRequestException(message);
    }
  };

  updateSalesmanIdCreated = async (data: any): Promise<User> => {
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

  checkValidateUser = async (user: LoginUserDTO): Promise<User> => {
    const { username, password }: LoginUserDTO = user;
    try {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              email: username,
            },
            {
              phoneNumber: username,
            },
          ],
        },
      });
      if (
        user &&
        password &&
        user.password &&
        (await compare(password, user.password))
      ) {
        delete user['password'];
        return user;
      }
      if (user && !password && user.provider === GOOGLE_PROVIDER) return user;
      return null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  findUserByEmailOrPhoneNumber = async (username: string): Promise<User> => {
    try {
      const user: User = await this.prismaService.user.findFirst({
        where: {
          OR: [
            {
              email: username,
            },
            {
              phoneNumber: username,
            },
          ],
        },
      });
      if (user) {
        delete user['password'];
        return user;
      }
      return null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  updateVerifyStatusUser = async (email: string): Promise<any> => {
    try {
      const user = await this.prismaService.user.update({
        where: {
          email,
        },
        data: {
          status: 'VERIFIED',
        },
      });
      if (user) return true;
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  enableNotification = async (
    user: UserSignIn,
    notificationDTO: NotificationDTO,
  ): Promise<any> => {
    try {
      const notification = await lastValueFrom(
        this.notificationClient.send('enable_notification', {
          user,
          notificationDTO,
        }),
      );
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  disableNotification = async (
    user: UserSignIn,
    notificationDTO: NotificationDTO,
  ): Promise<any> => {
    try {
      const notification = await lastValueFrom(
        this.notificationClient.send('disable_notification', {
          user,
          notificationDTO,
        }),
      );
      return notification;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  updateProfile = async (
    userId: string,
    updateProfileDTO: UpdateProfileDTO,
  ): Promise<any> => {
    try {
      const { username, address, gender, dateOfBirth, avatar } =
        updateProfileDTO;
      const data = {
        username,
        address,
        gender,
        avatar,
      };
      if (dateOfBirth)
        data['dateOfBirth'] = moment(dateOfBirth, 'DD/MM/YYYY').toDate();
      const user = await this.prismaService.user.update({
        data,
        where: {
          id: userId,
        },
      });
      //[Updated User] - Push notification
      user['notify_type'] = NOTIFICATION_UPDATED_USER;
      await lastValueFrom(
        this.notificationClient.emit('send_notification', user),
      );
      return {
        status: HttpStatus.OK,
        message: 'Updated profile successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  getAllNotifications = async (user: UserSignIn): Promise<any> => {
    try {
      const notifications = await lastValueFrom(
        this.notificationClient.send('get_all_notification', user),
      );
      return notifications;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };

  findUserByID = async (userId: string): Promise<boolean> => {
    try {
      const user: User = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });
      return user ? true : false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  };
}
