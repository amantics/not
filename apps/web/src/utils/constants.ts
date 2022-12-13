import { genRef } from "@/utils/helpers";
import NouvellesOperations from "@/views/NouvellesOperations.vue";

export const variants = {
  "en attente": "warning",
  accordé: "success",
  réalisé: "success",
  rejeté: "danger",
  débloqué: "success",
  "non encore débloqué": "warning",
};

export const fields: { [P in keyof TTransaction]?: string } = {
  ref: "#Référence",
  buyers: "Acheteurs (CIN)",
  sellers: "Vendeurs (CIN)",
  date: "Date opération",
  venteFile: "Compromis de vente",
  pret: "Prét",
  engagementNotary: "Engagement notarié",
  fondStatus: "Status des fonds",
  amount: "Prix de vente (MAD)",
  deposited: "Dépôt",
  minuteFile: "Minute",
  taxPaymentFile: "Paiement des impôts",
  inscriptionFiles: "Inscription",
  guaranteeFiles: "Garanties",
  benificiaryPaimentStatus: "Paiement des Bénéficiaires",
  ended: "Apurement",
};

export const defaultValues = () =>
  ({
    ref: genRef(5),
    pret: "en attente",
    fondStatus: "non encore débloqué",
    benificiaryPaimentStatus: "en attente",
    deposited: false,
    ended: false,
    buyers: [],
    sellers: [],
  } as unknown as TTransaction);

export const links = {
  notaire: [
    {
      path: "/",
      name: "Liste des nouvelles opérations",
      component: NouvellesOperations,
    },
    {
      path: "/livraison-engagement-notaire",
      name: "Engagement Notaire",
      component: () => import("@/views/LivraisonEngagementNotaire.vue"),
    },
    {
      path: "/depot",
      name: "Dépôt",
      component: () => import("@/views/Depot.vue"),
    },
    {
      path: "/signature-minute",
      name: "Signature Minute",
      component: () => import("@/views/SignatureMinute.vue"),
    },
    {
      path: "/paiment-impots-notaire",
      name: "Initialisation Paiement des Impôts",
      component: () => import("@/views/PaimentImpotsNotaire.vue"),
    },
    {
      path: "/apurement",
      name: "Apurement",
      component: () => import("@/views/Apurement.vue"),
    },
  ],
  bank: [
    {
      path: "/operations-entrantes",
      name: "Opérations Entrantes",
      component: () => import("@/views/OperationsEntrantes.vue"),
    },
    {
      path: "/operations-en-cours",
      name: "Déblocage des fonds",
      component: () => import("@/views/OperationsEnCours.vue"),
    },
  ],
  CDG: [
    {
      path: "/depot-fonds",
      name: "Dépôt des fonds à la CDG",
      component: () => import("@/views/DepotFonds.vue"),
    },
    {
      path: "/paiement-beneficiaires",
      name: "Paiement Bénéficiaires",
      component: () => import("@/views/PaiementBeneficiaires.vue"),
    },
    {
      path: "/paiement-impots-cdg",
      name: "Acceptation Paiement Impôts",
      component: () => import("@/views/PaimentImpotsCDG.vue"),
    },
  ],
  DGI: [
    {
      path: "/paiement-impots",
      name: "Paiement Impots",
      component: () => import("@/views/PaiementImpots.vue"),
    },
  ],
  ANCFCC: [
    {
      path: "/formalisation-garanties",
      name: "Formalisation Garanties",
      component: () => import("@/views/FormalisationGaranties.vue"),
    },
  ],
  promoteur: [
    {
      path: "/operations",
      name: "Opérations",
      component: () => import("@/views/Operations.vue"),
    },
  ],
};

export const roles = Object.keys(links) as (keyof typeof links)[];
