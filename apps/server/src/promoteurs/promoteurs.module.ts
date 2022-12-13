import { Module } from "@nestjs/common";
import { PromoteursService } from "./promoteurs.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import configuration from "../config/configuration";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Promoteur } from "./promoteur.entity";
import { NotificationsModule } from "../notifications/notifications.module";

const config = configuration();

@Module({
  imports: [
    TypeOrmModule.forFeature([Promoteur]),
    PassportModule,
    NotificationsModule,
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
  ],
  controllers: [],
  providers: [PromoteursService],
  exports: [PromoteursService],
})
export class PromoteursModule {}
