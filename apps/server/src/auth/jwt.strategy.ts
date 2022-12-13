import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import configuration from "../config/configuration";
import { PassportStrategy } from "@nestjs/passport";
import { UsersService } from "../users/users.service";
import { Promoteur } from "../promoteurs/promoteur.entity";
import { User } from "../users/user.entity";
import { PromoteursService } from "../promoteurs/promoteurs.service";
import { UserRole } from "../enums/userRole.enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private promoteursService: PromoteursService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configuration().jwt.secret,
    });
  }

  async validate(payload: any) {
    let user: Promoteur | User;
    let userPayload: { CIN?: string; secret: string; id?: number };
    if (payload.CIN) {
      //  promoteur
      userPayload = { CIN: payload.CIN, secret: payload.secret };
      user = await this.promoteursService.findByCIN(userPayload.CIN);
      user.role = UserRole.PROMOTEUR;
    } else {
      //  user
      userPayload = { id: payload.sub, secret: payload.secret };
      user = await this.usersService.findById(userPayload.id);
    }
    if (!user || user.secret !== userPayload.secret) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
