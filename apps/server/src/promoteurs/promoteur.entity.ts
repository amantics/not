import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Base } from "../entities/Base";
import { Exclude } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import ShortUniqueId from "short-unique-id";
import * as argon2 from "argon2";
import { UserRole } from "../enums/userRole.enum";
import { generateWalletInfo } from "../config/helpers";

@Entity()
export class Promoteur extends Base {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column()
  @Index({ unique: true })
  @ApiProperty()
  CIN: string;

  @Column()
  @ApiProperty()
  @Exclude()
  password: string;

  @Column("varchar", { array: true })
  references: string[] = [];

  @Column()
  walletAddress: string;

  @Column({ default: true })
  @ApiProperty()
  hasTempAddress: boolean;

  @Column()
  @Exclude()
  secret: string;

  @BeforeInsert()
  async assignDefaults() {
    const uid = new ShortUniqueId();
    this.secret = uid.randomUUID(16);
    this.CIN = this.CIN.toLowerCase();
    this.password = await argon2.hash(this.CIN);
    this.walletAddress = generateWalletInfo().walletAddress;
  }

  role: UserRole = UserRole.PROMOTEUR;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: new Date() })
  @ApiProperty({ default: new Date() })
  notificationsReadDate: Date;

  async verifyPassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }
}
