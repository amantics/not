import { Operation } from "../../../server/src/operations/operation.entity";
import { BeneficiaryPaymentStatus } from "../../../server/src/enums/beneficiaryPaymentStatus.enum";
import { CreditStatus } from "../../../server/src/enums/creditStatus.enum";
import { DepositStatus } from "../../../server/src/enums/depositStatus.enum";
import { TaxPaymentStatus } from "../../../server/src/enums/taxPaymentStatus.enum";
import { faker } from "@faker-js/faker";
import { arrayOf, pickRandom } from "@/utils/helpers";

export const operationData: Partial<Operation> = {
  amount: 0,
  beneficiaries: [],
  beneficiaryPaymentStatus: BeneficiaryPaymentStatus.PENDING,
  buyers: faker.random.words(3).split(" "),
  createdAt: new Date(),
  creditStatus: CreditStatus.REJECTED,
  date: new Date(),
  depositFile: "",
  depositStatus: DepositStatus.PENDING,
  ended: false,
  engagementNotaryFile: "",
  fundsUnblocked: false,
  guaranteeFiles: [],
  id: 1,
  minuteSignatureFile: "",
  reference: "tester",
  sellers: faker.random.words(3).split(" "),
  sellingFile: "",
  taxPaymentFile: "",
  taxPaymentStatus: TaxPaymentStatus.PENDING,
  updatedAt: new Date(),
};

export const operationsData = arrayOf(operationData, 8).map((v) => ({
  ...v,
  reference: "#" + Math.random().toString(36).slice(2, 8).toUpperCase(),
  creditStatus: pickRandom(Object.values(CreditStatus)),
  beneficiaryPaymentStatus: pickRandom(Object.values(BeneficiaryPaymentStatus)),
  fundsUnblocked: Math.random() > 0.5,
  sellingFile: Math.random() > 0.5 ? faker.internet.avatar() : "",
  engagementNotaryFile: Math.random() > 0.5 ? faker.internet.avatar() : "",
  amount: (Math.random() * 1000).toFixed(2),
  depositStatus: pickRandom(Object.values(DepositStatus)),
  depositFile: Math.random() > 0.5 ? faker.internet.avatar() : "",
  minuteSignatureFile: Math.random() > 0.5 ? faker.internet.avatar() : "",
  taxPaymentFile: Math.random() > 0.5 ? faker.internet.avatar() : "",
  taxPaymentStatus: pickRandom(Object.values(TaxPaymentStatus)),
  guaranteeFiles: arrayOf(faker.internet.avatar(), Math.random() > 0.5 ? 3 : 0),
  ended: Math.random() > 0.5,
}));
