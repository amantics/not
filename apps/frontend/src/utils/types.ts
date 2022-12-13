import { Operation } from "../../../server/src/operations/operation.entity";
import { User } from "../../../server/src/users/user.entity";
import { Promoteur } from "../../../server/src/promoteurs/promoteur.entity";

export type TOperation = Operation;

export type IPFSDownloadInfo = {
  cid: string;
  rootCid: string;
  name: string;
};

export type TUser = User | Promoteur;
