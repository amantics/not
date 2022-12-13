import { ApiProperty } from "@nestjs/swagger";
import { Operation } from "../operation.entity";

export class AddEngagementNotaryFileDto implements Partial<Operation> {
  @ApiProperty()
  engagementNotaryFile: string;
}
