import { Operation } from "../operation.entity";
import { ApiProperty } from "@nestjs/swagger";

export class TaxPaymentDto implements Partial<Operation> {
  @ApiProperty()
  taxPaymentFile: string;
}
