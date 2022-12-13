import { Module } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { OperationsController } from "./operations.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Operation } from "./operation.entity";
import { NotificationsModule } from "../notifications/notifications.module";
import { PromoteursModule } from "../promoteurs/promoteurs.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Operation]),
    NotificationsModule,
    PromoteursModule,
    UsersModule,
  ],
  providers: [OperationsService],
  controllers: [OperationsController],
  exports: [OperationsService],
})
export class OperationsModule {}
