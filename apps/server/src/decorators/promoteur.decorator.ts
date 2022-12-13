import { SetMetadata } from "@nestjs/common";

export const PROMOTEUR_KEY = "promoteurs";
export const PromoteurD = () => SetMetadata(PROMOTEUR_KEY, true);
