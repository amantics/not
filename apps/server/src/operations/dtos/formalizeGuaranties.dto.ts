import { ApiProperty } from "@nestjs/swagger";
import { Operation } from "../operation.entity";

export class FormalizeGuarantiesDto implements Partial<Operation> {
  @ApiProperty({ type: [String], description: "hases of the hosted files" })
  guaranteeFiles: string[];
}
