import { Role, Gender } from '@prisma/client';
import { IsString, IsEmail, IsEnum, Matches } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  username?: string;
  @IsEmail()
  email?: string;
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least 8 characters, one uppercase, one number and one special case character',
    },
  )
  password: string;
  @IsString()
  phoneNumber?: string;
  @IsString()
  address?: string;
  @IsEnum([Role.SALESMAN, Role.PURCHASER], {
    message: 'Role must be following format: [SALESMAN, PURCHASER]',
  })
  role: Role;
  @IsEnum([Gender.MALE, Gender.FEMALE, Gender.OTHER], {
    message: 'Role must be following format: [MALE, FEMALE, OTHER]',
  })
  gender: Gender;
  @IsString()
  dateOfBirth?: string;
  @IsString()
  avatar?: string;
}

// export class MessageUser {
//   status: number;
//   message: string;
// }

export class Tokens {
  accessToken: string;
  refreshToken: string;
}

export class FormatDataUser {
  password: string;
  dateOfBirth: Date;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  role: Role;
  gender: Gender;
  avatar?: string;
}

export class LoginUserDTO {
  username: string;
  password: string;
}
