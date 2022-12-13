import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { OperationsModule } from "../operations/operations.module";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module";
import { AdminModule } from "@adminjs/nestjs";
import AdminJS from "adminjs";
import { Database, Resource } from "@adminjs/typeorm";
import { User } from "../users/user.entity";
import { ConfigModule } from "@nestjs/config";
import configuration from "../config/configuration";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuthModule } from "../auth/auth.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { Notification } from "../notifications/notification.entity";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { EthersModule } from "../ethers/ethers.module";
import { PromoteursModule } from "../promoteurs/promoteurs.module";
import { Promoteur } from "../promoteurs/promoteur.entity";
import { PromoteurGuard } from "../guards/promoteur.guard";

AdminJS.registerAdapter({ Database, Resource });

const config = configuration();

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...(config.database as Partial<TypeOrmModuleOptions>),
      autoLoadEntities: true,
      synchronize: true,
      ssl: config.database.ssl,

      // logging: config.isDev,
      extra: config.database.ssl
        ? {
            ssl: {
              rejectUnauthorized: false,
            },
          }
        : undefined,
    }),
    AdminModule.createAdmin({
      adminJsOptions: {
        rootPath: "/admin",
        resources: [User, Notification, Promoteur],
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "frontend"),
      exclude: ["/api/**", "/admin/**"],
    }),
    PassportModule,
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
    OperationsModule,
    UsersModule,
    NotificationsModule,
    AuthModule,
    EthersModule,
    PromoteursModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PromoteurGuard,
    },
  ],
})
export class AppModule {}
