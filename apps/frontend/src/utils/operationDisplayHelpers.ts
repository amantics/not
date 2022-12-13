import { TOperation } from "@/utils/types";
import { DepositStatus } from "../../../server/src/enums/depositStatus.enum";
import { TaxPaymentStatus } from "../../../server/src/enums/taxPaymentStatus.enum";

export const downloadableFields: (keyof TOperation)[] = [
  "sellingFile",
  "engagementNotaryFile",
  "depositFile",
  "minuteSignatureFile",
  "taxPaymentFile",
];
export const statusFields: (keyof TOperation)[] = [
  "creditStatus",
  "beneficiaryPaymentStatus",
];
export const awaitingStepsStatusList: TOperation[keyof TOperation][] = [
  DepositStatus.PENDING,
  DepositStatus.SIGNED,
  TaxPaymentStatus.PENDING,
  TaxPaymentStatus.INITIALIZED,
  TaxPaymentStatus.ACCEPTED,
];

type StatusFields<T extends TOperation> = {
  [key in keyof Partial<T>]: keyof T;
};
export const isPending = <T extends TOperation>(
  field: keyof T,
  operation: Partial<T>
) => {
  const statusFields: StatusFields<T> = {
    taxPaymentFile: "taxPaymentStatus",
    depositFile: "depositStatus",
  } as StatusFields<T>;

  return (
    !(
      field === "depositFile" &&
      operation.depositStatus === DepositStatus.ACCEPTED
    ) &&
    statusFields[field] &&
    awaitingStepsStatusList.includes(
      operation[statusFields[field]] as unknown as string
    )
  );
};
