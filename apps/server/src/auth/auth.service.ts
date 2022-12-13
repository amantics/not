import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(user: User) {
    const payload = { sub: user.id, secret: user.secret };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.usersService.parseUser(user),
    };
  }
}
