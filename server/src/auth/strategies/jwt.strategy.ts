
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const strategyOptions:StrategyOptions={
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    }
    super(strategyOptions)
  }

async validate(payload: any) {
  const { sub, role, ...rest } = payload;
  console.log("🚀 ~ JwtStrategy ~ validate ~ payload:", payload);

  // Optionally fetch user from DB if you want fresh data:
  // const user = await this.usersService.findById(sub);
                
  return { id: sub, role: role?.toLowerCase(), ...rest }; // <-- attach role explicitly

  }
}