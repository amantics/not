import { Promoteur } from "../promoteur.entity";
import { ApiProperty } from "@nestjs/swagger";

export class PromoteurLoginDto implements Partial<Promoteur> {
  @ApiProperty()
  CIN: string;

  @ApiProperty()
  password: string;
}
