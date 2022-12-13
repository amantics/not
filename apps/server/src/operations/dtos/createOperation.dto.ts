import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Operation } from "../operation.entity";

export class CreateOperationDto implements Partial<Operation> {
  @ApiProperty()
  date: Date;

  @ApiProperty({ type: [String] })
  buyers: string[];

  @ApiProperty({ type: [String] })
  sellers: string[];

  @ApiPropertyOptional({
    default: 0,
    description: "transaction money (montant)",
  })
  amount: number;

  @ApiProperty({
    description: "hosted selling file (compromise de vente) link or hash",
  })
  sellingFile: string;
}
