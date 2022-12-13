import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOperator, Raw, Repository } from "typeorm";
import { Promoteur } from "./promoteur.entity";
import { JwtService } from "@nestjs/jwt";
import { Operation } from "../operations/operation.entity";
import { UserRole } from "../enums/userRole.enum";

@Injectable()
export class PromoteursService {
  constructor(
    @InjectRepository(Promoteur)
    private promoteurRepository: Repository<Promoteur>,
    private jwtService: JwtService
  ) {}

  async login(promoteur: Promoteur) {
    const payload = { CIN: promoteur.CIN, secret: promoteur.secret };
    return {
      access_token: this.jwtService.sign(payload),
      user: this.parsePromoteur(promoteur),
    };
  }

  public parsePromoteur(promoteur: Promoteur) {
    return {
      role: UserRole.PROMOTEUR,
      CIN: promoteur.CIN,
      name: promoteur.name ?? promoteur.CIN,
      avatar: promoteur.avatar,
      email: promoteur.email,
      notificationsReadDate: promoteur.notificationsReadDate,
      walletAddress: promoteur.walletAddress,
      hasTempAddress: promoteur.hasTempAddress,
    };
  }

  async findByCIN(CIN: string) {
    return this.promoteurRepository.findOneBy({
      CIN: Raw((alias) => `LOWER(${alias}) = LOWER(:value)`, {
        value: CIN,
      }) as unknown as FindOperator<string>,
    });
  }

  async findByManyByCIN(CINs: string[]) {
    //   find all promoteurs with CIN in CINs in lowercase to avoid duplicates
    return this.promoteurRepository.find({
      where: {
        CIN: Raw((alias) => `LOWER(${alias}) IN (:...values)`, {
          values: CINs.map((CIN) => CIN.toLowerCase()),
        }),
      },
    });
  }

  async update(promoteur: Promoteur) {
    return this.promoteurRepository.save(promoteur);
  }

  async insertMany(promoteurs: Promoteur[]) {
    return this.promoteurRepository.insert(promoteurs);
  }

  async attach(operation: Operation) {
    const promoteurs = await this.findByManyByCIN([
      ...operation.sellers,
      ...operation.buyers,
    ]);
    const newPromoteurs: Promoteur[] = [];
    const promoteursByCINMap = promoteurs.reduce((acc, promoteur) => {
      return { ...acc, [promoteur.CIN.toLowerCase()]: promoteur };
    }, {});
    new Set([...operation.sellers, ...operation.buyers]).forEach((CIN) => {
      if (!promoteursByCINMap[CIN.toLowerCase()]) {
        const promoteur = new Promoteur();
        promoteur.CIN = CIN;
        promoteur.references = [operation.reference];
        newPromoteurs.push(promoteur);
      } else {
        promoteursByCINMap[CIN.toLowerCase()].references.push(
          operation.reference
        );
      }
    });
    return this.promoteurRepository.save([
      ...newPromoteurs,
      ...Object.values(promoteursByCINMap),
    ]);
  }

  async findOneByAddress(walletAddress: string) {
    return this.promoteurRepository.findOneBy({ walletAddress });
  }

  async findAll(options?: FindManyOptions<Promoteur>) {
    return this.promoteurRepository.find(options);
  }
}
