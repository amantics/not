import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { ApiBearerAuth, ApiForbiddenResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "../enums/userRole.enum";
import { UserD } from "../decorators/user.decorator";
import { User } from "../users/user.entity";
import { Promoteur } from "../promoteurs/promoteur.entity";

@Controller("notifications")
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("Notifications")
@ApiForbiddenResponse({ description: "Forbidden." })
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get("/")
  async getAll(@UserD() user: User | Promoteur) {
    switch (user.role) {
      case UserRole.PROMOTEUR:
        return this.notificationsService.findAllByPromoteur(
          (user as Promoteur).CIN
        );
      case UserRole.NOTAIRE:
        return this.notificationsService.findAllByOwnerId(user.id);
      default:
        return this.notificationsService.findAllByRole(user.role);
    }
  }
}
