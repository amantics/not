import { Operation } from "../operation.entity";
import { ApiProperty } from "@nestjs/swagger";
import { CreditStatus } from "../../enums/creditStatus.enum";

export class ChangeCreditStatusDto implements Partial<Operation> {
  @ApiProperty({
    enum: [CreditStatus.GRANTED, CreditStatus.REJECTED],
    default: CreditStatus.GRANTED,
  })
  creditStatus: CreditStatus;
}
