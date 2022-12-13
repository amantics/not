import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/user.entity";
import { IsEmail, Min } from "class-validator";

export class LoginDto implements Partial<User> {
  @ApiProperty({ default: "email@notary.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ default: "password" })
  @Min(8)
  password: string;
}
