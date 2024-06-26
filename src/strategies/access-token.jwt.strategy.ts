import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadDTO } from 'src/user/dto/createUserDTO';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
    });
  }

  async validate(payload: PayloadDTO) {
    const user = await this.userService.findUserByEmailOrPhoneNumber(
      payload.username,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
