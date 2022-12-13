import { RoleRoutesMap } from "./routes";
import { UserRole } from "../../../../apps/server/src/enums/userRole.enum";
import { Operation } from "../../../../apps/server/src/operations/operation.entity";

export enum NotificationsMessages {
  initiated = "initiated",
  ended = "ended",
  creditGranted = "creditGranted",
  creditRefused = "creditRefused",
  fundsUnblocked = "fundsUnblocked",
  notaryAdded = "notaryAdded",
  depositSigned = "depositSigned",
  depositAccepted = "depositAccepted",
  minuteFileAdded = "minuteFileAdded",
  taxPaymentInitiated = "taxPaymentInitiated",
  taxPaymentAccepted = "taxPaymentAccepted",
  taxPaid = "taxPaid",
  guarantiesFormalized = "guarantiesFormalized",
  beneficiaryPaid = "beneficiaryPaid",
  beneficiaryInitiated = "beneficiaryInitiated",
}

export enum Messages {
  initiated = "Opération initiée",
  ended = "Opération apurée",
  creditGranted = "Crédit accordé",
  creditRefused = "Crédit refusé",
  fundsUnblocked = "Fonds débloqués",
  notaryAdded = "Engagement notarié ajouté",
  depositSigned = "Dépôt signé",
  depositAccepted = "Dépôt accepté",
  minuteFileAdded = "Document de la Minute ajouté",
  taxPaymentInitiated = "Paiement des impôts initié",
  taxPaymentAccepted = "Paiement des impôts accepté",
  taxPaid = "Impôts payés",
  guarantiesFormalized = "Garanties formalisées",
  beneficiaryPaid = "Bénéficiaire payé",
  beneficiaryInitiated = "Paiement du Bénéficiaire a été initié",
}

export type IntendedTo = {
  [key in keyof RoleRoutesMap]?: keyof RoleRoutesMap[key];
};
export const notificationsIntendedTo: {
  [K in NotificationsMessages]: IntendedTo;
} = {
  [NotificationsMessages.initiated]: {
    [UserRole.BANQUE]: "incomingOperations",
  },
  [NotificationsMessages.ended]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.CDG]: "fundsDeposit",
  },
  [NotificationsMessages.creditGranted]: {
    [UserRole.NOTAIRE]: "engagementNotary",
  },
  [NotificationsMessages.creditRefused]: {
    [UserRole.NOTAIRE]: "engagementNotary",
  },
  [NotificationsMessages.fundsUnblocked]: {
    [UserRole.CDG]: "fundsDeposit",
    [UserRole.NOTAIRE]: "deposit",
  },
  [NotificationsMessages.notaryAdded]: {
    [UserRole.BANQUE]: "ongoingOperations",
  },
  [NotificationsMessages.depositSigned]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.CDG]: "fundsDeposit",
  },
  [NotificationsMessages.depositAccepted]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.NOTAIRE]: "minute",
  },
  [NotificationsMessages.minuteFileAdded]: {
    [UserRole.BANQUE]: "ongoingOperations",
  },
  [NotificationsMessages.taxPaymentInitiated]: {
    [UserRole.CDG]: "acceptTaxPayment",
  },
  [NotificationsMessages.taxPaymentAccepted]: {
    [UserRole.DGI]: "taxPayment",
  },
  [NotificationsMessages.taxPaid]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.NOTAIRE]: "minute",
  },
  [NotificationsMessages.guarantiesFormalized]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.NOTAIRE]: "minute",
  },
  [NotificationsMessages.beneficiaryPaid]: {
    [UserRole.BANQUE]: "ongoingOperations",
    [UserRole.NOTAIRE]: "deposit",
  },
  [NotificationsMessages.beneficiaryInitiated]: {
    [UserRole.CDG]: "beneficiariesPayment",
  },
};

export type NotificationPayload = {
  message: NotificationsMessages;
  intendedTo: IntendedTo;
  reference: string;
  createdAt: Date | string;
  operation: Operation;
};
