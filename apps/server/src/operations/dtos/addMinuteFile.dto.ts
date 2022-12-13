import { Operation } from "../operation.entity";
import { ApiProperty } from "@nestjs/swagger";

export class AddMinuteFileDto implements Partial<Operation> {
  @ApiProperty()
  minuteSignatureFile: string;
}
