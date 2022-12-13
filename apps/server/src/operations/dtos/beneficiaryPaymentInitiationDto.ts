import { Operation } from "../operation.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Beneficiary } from "../beneficiary";

export class BeneficiaryPaymentInitiationDto implements Partial<Operation> {
  @ApiProperty({ type: [Beneficiary] })
  beneficiaries: Beneficiary[];
}
