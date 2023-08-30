import { Role, Gender } from '@prisma/client';
import { IsString, IsEmail, IsEnum, Matches, IsDate } from 'class-validator';

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
  @IsDate()
  dateOfBirth: Date;
  @IsString()
  avatar: string;
}
