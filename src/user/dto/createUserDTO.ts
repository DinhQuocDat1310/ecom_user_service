import { Role, Gender } from '@prisma/client';
import {
  IsString,
  IsEmail,
  IsEnum,
  Matches,
  ValidateIf,
} from 'class-validator';
import { GOOGLE_PROVIDER } from '../constants/service';

export class CreateUserDTO {
  @IsString()
  username?: string;
  @IsEmail()
  email?: string;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  password: string;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  phoneNumber: string;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsString()
  address: string;
  @IsEnum([Role.SALESMAN, Role.PURCHASER], {
    message: 'Role must be following format: [SALESMAN, PURCHASER]',
  })
  role?: Role;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  @IsEnum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    message: 'Gender must be following format: [MALE, FEMALE, OTHER]',
  })
  gender: Gender;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  dateOfBirth: string;
  @IsString()
  avatar: string;
  provider: string;
}

export class Tokens {
  accessToken: string;
  refreshToken: string;
}

export class FormatDataUser {
  password?: string;
  dateOfBirth?: Date;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role?: Role;
  gender: Gender;
  avatar?: string;
  provider?: string;
}

export class LoginUserDTO {
  username: string;
  @ValidateIf((user) => user.provider !== GOOGLE_PROVIDER)
  password?: string;
}
