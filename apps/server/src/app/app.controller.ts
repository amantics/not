import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  UseInterceptors,
} from "@nestjs/common";

import { AppService } from "./app.service";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { UserD } from "../decorators/user.decorator";
import { UsersService } from "../users/users.service";
import { User } from "../users/user.entity";
import { Promoteur } from "../promoteurs/promoteur.entity";
import { PromoteursService } from "../promoteurs/promoteurs.service";

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private usersService: UsersService,
    private promoteursService: PromoteursService
  ) {}

  @Get("me")
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  async me(@UserD() user: User) {
    return user;
  }

  @Put("/notifications/read")
  @ApiBearerAuth()
  @ApiOkResponse({ type: User })
  async readNotifications(@UserD() user: User | Promoteur) {
    user.notificationsReadDate = new Date();
    if (user instanceof Promoteur) {
      return this.promoteursService.update(user);
    }
    return this.usersService.update(user);
  }
}
