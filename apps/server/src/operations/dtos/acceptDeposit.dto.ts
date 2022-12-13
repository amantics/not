import { Operation } from "../operation.entity";
import { ApiProperty } from "@nestjs/swagger";

export class AcceptDepositDto implements Partial<Operation> {
  @ApiProperty()
  depositFile: string;
}
