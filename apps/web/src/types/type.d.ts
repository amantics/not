type TRole = "notaire" | "bank" | "CDG" | "DGI" | "ANCFCC" | "promoteur";
type TEntity = { buyer: string; seller: string };
type TTransaction = {
  ref: string;
  buyers: string[];
  sellers: string[];
  date: string;
  venteFile: File | null;
  pret: "en attente" | "accordé" | "Rejeté";
  engagementNotary: File | null;
  fondStatus: "non encore débloqué" | "débloqué";
  amount: number;
  deposited: boolean;
  depositFile: File | null;
  minuteFile: File | null;
  taxPaymentFile: File | null;
  inscriptionFiles: FileList | null;
  guaranteeFiles: FileList | null;
  benificiaryPaimentStatus: "en attente" | "réalisé";
  ended: boolean;
  taxPaymentStatus: undefined | "INITIALIZED" | "ACCEPTED";
};

type RefTransaction = TTransaction | null;
type RefTransactionList = { value: TTransaction[] } | null;

type TNotification = {
  ref: string;
  message: string;
  intendedTo: { [key: number]: boolean };
  paths?: { [P in TRole]?: string };
};

type TAddNotification = (notification: TNotification) => void;
type TAddTransaction = (transaction: TTransaction) => void;
