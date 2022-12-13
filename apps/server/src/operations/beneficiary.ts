import { ApiProperty } from "@nestjs/swagger";

export class Beneficiary {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
