import { UserRole } from "../../../../apps/server/src/enums/userRole.enum";
import { linksMapByName } from "./links";

export const rolesRoutesMap = {
  [UserRole.PROMOTEUR]: {
    operations: linksMapByName.operations,
  },
  [UserRole.ANCFCC]: {
    formalizeGuaranties: linksMapByName.formalizeGuaranties,
  },
  [UserRole.BANQUE]: {
    incomingOperations: linksMapByName.incomingOperations,
    ongoingOperations: linksMapByName.ongoingOperations,
  },
  [UserRole.CDG]: {
    fundsDeposit: linksMapByName.fundsDeposit,
    beneficiariesPayment: linksMapByName.beneficiaryPayment,
    acceptTaxPayment: linksMapByName.acceptTaxPayment,
  },
  [UserRole.DGI]: {
    taxPayment: linksMapByName.taxPayment,
  },
  [UserRole.NOTAIRE]: {
    newOperations: linksMapByName.newOperations,
    engagementNotary: linksMapByName.engagementNotary,
    deposit: linksMapByName.deposit,
    minute: linksMapByName.minute,
    initializeTaxPayment: linksMapByName.initializeTaxPayment,
    ended: linksMapByName.ended,
    initiateBeneficiary: linksMapByName.initiateBeneficiary,
  },
};

export type RoleRoutesMap = typeof rolesRoutesMap;
