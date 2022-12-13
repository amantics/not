import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/user.entity";
import { UserRole } from "../enums/userRole.enum";
import { IsEmail, IsNotIn, IsString, Min } from "class-validator";

export class RegisterDto implements Partial<User> {
  @ApiProperty({ default: "email@notary.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ default: "password" })
  @Min(8)
  password: string;

  @ApiProperty({ default: "John Smith" })
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole, default: UserRole.NOTAIRE, type: "enum" })
  @IsNotIn([UserRole.PROMOTEUR])
  role: UserRole;
}
