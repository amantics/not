import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PROMOTEUR_KEY } from "../decorators/promoteur.decorator";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class PromoteurGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPromoteurRequired = this.reflector.getAllAndOverride<boolean>(
      PROMOTEUR_KEY,
      [context.getHandler(), context.getClass()]
    );
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isPromoteurRequired || isPublic) return true;
    const { user } = context.switchToHttp().getRequest();
    return !!user.CIN;
  }
}
