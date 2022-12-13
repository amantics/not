import { DepositStatus } from "../enums/depositStatus.enum";
import { CreditStatus } from "../enums/creditStatus.enum";
import { BeneficiaryPaymentStatus } from "../enums/beneficiaryPaymentStatus.enum";
import { TaxPaymentStatus } from "../enums/taxPaymentStatus.enum";
import ShortUniqueId from "short-unique-id";
import { Base } from "../entities/Base";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/user.entity";
import { UnauthorizedException } from "@nestjs/common";
import {
  IntendedTo,
  NotificationPayload,
  notificationsIntendedTo,
  NotificationsMessages,
} from "../../../../libs/shared/src/lib/notifications";
import { Exclude } from "class-transformer";
import { UserRole } from "../enums/userRole.enum";
import { Beneficiary } from "./beneficiary";
import { TokenTransfer } from "./TokenTransfer";

export class Operation extends Base {
  constructor(data?: Partial<Operation>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
    if (!this.reference) {
      this.generateReference();
    }
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  reference: string;

  owner: number;

  @ApiProperty({ type: [String] })
  buyers: string[];

  @ApiProperty({ type: [String] })
  sellers: string[];

  @ApiProperty()
  date: Date;

  @ApiProperty({ type: Number })
  amount = 0;

  @ApiProperty({ enum: DepositStatus, default: DepositStatus.PENDING })
  depositStatus: DepositStatus = DepositStatus.PENDING;

  @ApiProperty({ nullable: true })
  depositFile?: string;

  @ApiProperty({ nullable: true })
  engagementNotaryFile?: string;

  @ApiProperty({ nullable: true })
  sellingFile?: string;

  @ApiProperty({ nullable: true })
  minuteSignatureFile?: string;

  @ApiProperty({ nullable: true })
  taxPaymentFile?: string;

  @ApiProperty({ type: [String] })
  guaranteeFiles?: string[];

  @ApiProperty({ enum: CreditStatus, default: CreditStatus.PENDING })
  creditStatus: CreditStatus = CreditStatus.PENDING;

  @ApiProperty({ nullable: true, type: [Beneficiary] })
  beneficiaries?: Beneficiary[] = [];

  @ApiProperty({
    enum: BeneficiaryPaymentStatus,
    default: BeneficiaryPaymentStatus.PENDING,
  })
  beneficiaryPaymentStatus: BeneficiaryPaymentStatus =
    BeneficiaryPaymentStatus.PENDING;

  @ApiProperty({ enum: TaxPaymentStatus, default: TaxPaymentStatus.PENDING })
  taxPaymentStatus: TaxPaymentStatus = TaxPaymentStatus.PENDING;

  @ApiProperty({ default: false })
  ended = false;

  @ApiProperty({ default: false })
  fundsUnblocked = false;

  generateReference() {
    const uid = new ShortUniqueId({ length: 10 });

    this.reference = uid();
  }

  @ApiProperty()
  createdAt: Date = new Date();

  @ApiProperty()
  updatedAt: Date = new Date();

  @Exclude()
  notification?: NotificationsMessages;

  public generateNotification() {
    const primaryKeys = [
      ...Array.from(
        new Set([...this.sellers, ...this.buyers].map((v) => v.toLowerCase()))
      ),
      this.reference,
    ]; // add promoteurs and reference as primary keys first

    const message = this.notification;
    const intendedTo = notificationsIntendedTo[message] as IntendedTo;
    for (const role in intendedTo) {
      if (role === UserRole.NOTAIRE) {
        // scope operations to their creators if notification is intended to notary role
        primaryKeys.push(this.owner.toString());
        continue;
      }
      primaryKeys.push(role);
    }
    const payload: NotificationPayload = {
      message,
      intendedTo,
      reference: this.reference,
      createdAt: new Date(),
      operation: this,
    };
    delete this.notification;
    return { primaryKeys, payload: JSON.stringify(payload) };
  }

  update(updates: Partial<Operation>) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  ownerGuard(owner: User) {
    if (this.owner !== owner.id) {
      throw new UnauthorizedException(
        "You are not the owner of this operation"
      );
    }
  }

  transferOperation?: TokenTransfer = new TokenTransfer();
}
