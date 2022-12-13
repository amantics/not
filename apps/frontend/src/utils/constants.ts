import { CreditStatus } from "../../../server/src/enums/creditStatus.enum";
import { TOperation } from "@/utils/types";
import { UserRole } from "../../../server/src/enums/userRole.enum";
import { BeneficiaryPaymentStatus } from "../../../server/src/enums/beneficiaryPaymentStatus.enum";
import { linksMapByName } from "../../../../libs/shared/src/lib/links";
import { NotificationsMessages } from "../../../../libs/shared/src/lib/notifications";

export const statusIcons: {
  [K in CreditStatus | BeneficiaryPaymentStatus | string]: string;
} = {
  [CreditStatus.GRANTED]: "checkmark-circle-outline",
  [CreditStatus.PENDING]: "refresh-circle-outline",
  ONGOING: "refresh-circle-outline",
  [CreditStatus.REJECTED]: "close-circle-outline",
  [BeneficiaryPaymentStatus.REALIZED]: "checkmark-circle-outline",
  [BeneficiaryPaymentStatus.INITIATED]: "refresh-circle-outline",
};

export const IPFS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNDQzM2QzVFMDM2NTdBMGRlN0RiNDA5MmY5QWJhZkRiMDE2MjgzMWQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjAzMTQwMDcyNDcsIm5hbWUiOiJub3RhcnkifQ._IS9KuFARop6NCJ21sVEemq9er1vJ5lvJZxS8cXo2pc";

export const labels: { [K in keyof TOperation]?: string } = {
  reference: "#",
  date: "Date opération",
  creditStatus: "Crédit",
  buyers: "Acheteurs(CIN)",
  sellers: "Vendeurs(CIN)",
  sellingFile: "Compromis de vente",
  engagementNotaryFile: "Engagement notarié",
  fundsUnblocked: "Status des fonds",
  amount: "Prix de vente (MAD)",
  depositFile: "Dépôt",
  minuteSignatureFile: "Minute",
  taxPaymentFile: "Paiement des impôts",
  guaranteeFiles: "Inscription",
  beneficiaryPaymentStatus: "Paiement des Bénéficiaires",
  ended: "Apurement",
};

type TLink = {
  label: string;
  icon: string;
  path: typeof linksMapByName[keyof typeof linksMapByName];
};

// @ts-ignore
export const linksByRole: { [K in UserRole]: TLink[] } = {
  [UserRole.NOTAIRE]: [
    {
      label: "Nouvelles opérations",
      icon: "reader",
      path: linksMapByName.newOperations,
    },
    {
      label: "Engagement notarié",
      icon: "archive-outline",
      path: linksMapByName.engagementNotary,
    },
    {
      label: "Dépôt des fonds à la CDG",
      icon: "wallet-outline",
      path: linksMapByName.deposit,
    },
    {
      label: "Signature de la minute",
      icon: "document-text-outline",
      path: linksMapByName.minute,
    },
    {
      label: "Paiement des impôts",
      icon: "cash-outline",
      path: linksMapByName.initializeTaxPayment,
    },
    {
      label: "Paiement des bénéficiaires",
      icon: "cash-outline",
      path: linksMapByName.initiateBeneficiary,
    },
    {
      label: "Apurements",
      icon: "checkmark-circle-outline",
      path: linksMapByName.ended,
    },
  ],
  [UserRole.BANQUE]: [
    {
      label: "Décisions crédit",
      icon: "arrow-forward-outline",
      path: linksMapByName.incomingOperations,
    },
    {
      label: "Déblocage des fonds",
      icon: "trending-up-outline",
      path: linksMapByName.ongoingOperations,
    },
  ],
  [UserRole.CDG]: [
    {
      label: "Dépôt des fonds",
      icon: "wallet-outline",
      path: linksMapByName.fundsDeposit,
    },
    {
      label: "Paiement des bénéficiaires",
      icon: "cash-outline",
      path: linksMapByName.beneficiaryPayment,
    },
    {
      label: "Paiement des impôts",
      icon: "cash-outline",
      path: linksMapByName.acceptTaxPayment,
    },
  ],
  [UserRole.DGI]: [
    {
      label: "Paiement des impôts",
      icon: "cash-outline",
      path: linksMapByName.taxPayment,
    },
  ],
  [UserRole.ANCFCC]: [
    {
      label: "Formalisation des guaranties",
      icon: "checkmark-circle-outline",
      path: linksMapByName.formalizeGuaranties,
    },
  ],
  [UserRole.PROMOTEUR]: [
    {
      label: "Opérations",
      icon: "arrow-forward-outline",
      path: linksMapByName.operations,
    },
  ],
} as const;

export const enumLabels: {
  [K in CreditStatus | BeneficiaryPaymentStatus]: string;
} = {
  GRANTED: "accordé",
  PENDING: "en attente",
  REJECTED: "rejeté",
  REALIZED: "réalisé",
  INITIATED: "en attente",
};

export const activityIcon: { [K in NotificationsMessages]: string } = {
  initiated: "arrow-forward-outline",
  ended: "checkmark-circle-outline",
  creditGranted: "checkmark-circle-outline",
  creditRefused: "close-circle-outline",
  fundsUnblocked: "checkmark-circle-outline",
  notaryAdded: "archive-outline",
  depositSigned: "wallet-outline",
  depositAccepted: "wallet-outline",
  minuteFileAdded: "document-text-outline",
  taxPaymentInitiated: "cash-outline",
  taxPaymentAccepted: "cash-outline",
  taxPaid: "cash-outline",
  guarantiesFormalized: "checkmark-circle-outline",
  beneficiaryPaid: "cash-outline",
  beneficiaryInitiated: "checkmark-circle-outline",
};

export const disabledReasons: { [K in keyof TOperation]?: string } = {
  engagementNotaryFile: "Crédit non accordé!",
  guaranteeFiles: "Paiement des impôts non payé!",
  fundsUnblocked: "Engagement notaire non fourni!",
  depositFile: "Fonds non débloqués!",
  ended: "Bénéficiaires non payés!",
  taxPaymentFile: "Signature de la minute non fournie!",
  beneficiaryPaymentStatus: "Garanties non chargées!",
  minuteSignatureFile: "Dépôt non accepté!",
};
