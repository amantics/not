import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserRole } from "../enums/userRole.enum";
import { Base } from "../entities/Base";
import * as argon2 from "argon2";
import { Exclude } from "class-transformer";
import ShortUniqueId from "short-unique-id";
import { ApiProperty } from "@nestjs/swagger";
import { Notification } from "../notifications/notification.entity";

@Entity()
export class User extends Base {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @Index({ unique: true })
  @Exclude()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  @ApiProperty()
  name: string;

  @Column({ enum: UserRole, default: UserRole.NOTAIRE, type: "enum" })
  @ApiProperty({ enum: UserRole, default: UserRole.NOTAIRE })
  role: UserRole;

  @OneToMany(() => User, (user) => user.children)
  children: User[];

  @ManyToOne(() => User, (user) => user.children, {
    nullable: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  parent?: User;

  @Column({ default: new Date() })
  @ApiProperty({ default: new Date() })
  notificationsReadDate: Date;

  @Column({ default: "secret" })
  @Exclude()
  secret: string;

  @Column({ nullable: true })
  @Exclude()
  privateKey?: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => Notification, (notification) => notification.owner)
  notifications: Notification[];

  @Column()
  @ApiProperty()
  walletAddress: string;

  @Column({ default: true })
  @ApiProperty()
  hasTempAddress: boolean;

  @BeforeInsert()
  async assignDefaults() {
    const uid = new ShortUniqueId();
    this.secret = uid.randomUUID(16);
    this.password = await argon2.hash(this.password);
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }
}
