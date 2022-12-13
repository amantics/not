import { CreditStatus } from "../../../../apps/server/src/enums/creditStatus.enum";
import { TaxPaymentStatus } from "../../../../apps/server/src/enums/taxPaymentStatus.enum";
import { BeneficiaryPaymentStatus } from "../../../../apps/server/src/enums/beneficiaryPaymentStatus.enum";
import { DepositStatus } from "../../../../apps/server/src/enums/depositStatus.enum";
import ShortUniqueId from "short-unique-id";

export class Operation {
  constructor(data: Partial<Operation>) {
    this.generateReference();
    Object.assign(this, data);
  }

  id = 0;

  reference = "";

  buyers: string[] = [];

  sellers: string[] = [];

  date: Date = new Date();

  amount = 0;

  depositStatus = DepositStatus.PENDING;

  depositFile?: string;

  engagementNotaryFile?: string;

  sellingFile?: string;

  minuteSignatureFile?: string;

  taxPaymentFile?: string;

  guaranteeFiles?: string[];

  creditStatus = CreditStatus.PENDING;

  beneficiaryId?: string;

  beneficiaryPaymentStatus = BeneficiaryPaymentStatus.PENDING;

  taxPaymentStatus = TaxPaymentStatus.PENDING;

  ended = false;

  fundsUnblocked = false;

  generateReference() {
    const uid = new ShortUniqueId({ length: 10 });

    this.reference = uid();
  }
}
