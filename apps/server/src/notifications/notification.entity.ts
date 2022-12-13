import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRole } from "../enums/userRole.enum";
import { Base } from "../entities/Base";
import { User } from "../users/user.entity";
import { rolesRoutesMap } from "../../../../libs/shared/src/lib/routes";

@Entity()
export class Notification extends Base {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column("varchar", { array: true })
  intendedRoles: UserRole[];

  @Column("varchar", { array: true })
  intendedRoutes: string[];

  @Column({ nullable: true })
  reference?: string;

  @Column("varchar", { array: true })
  promoteurs: string[];

  @ManyToOne(() => User, (user) => user.notifications, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  owner?: User;

  @Column({ nullable: true })
  ownerId?: number;

  @BeforeInsert()
  before() {
    this.intendedRoles = [...this.intendedRoles, UserRole.PROMOTEUR];
    this.intendedRoutes = [
      ...this.intendedRoutes,
      rolesRoutesMap[UserRole.PROMOTEUR].operations,
    ];
  }
}
