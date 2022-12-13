import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { Notification } from "./notification.entity";
import { UserRole } from "../enums/userRole.enum";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.notificationsRepository.find();
  }

  async findOne(id: number): Promise<Notification> {
    return this.notificationsRepository.findOneBy({ id });
  }

  async findAllByRole(role: UserRole): Promise<Notification[]> {
    return this.notificationsRepository
      .createQueryBuilder("notifications")
      .where(":role = any (notifications.intendedRoles)", { role })
      .orderBy("notifications.id", "DESC")
      .getMany();
  }

  async findAllByOwnerId(id: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { ownerId: id },
      order: { id: "DESC" },
    });
  }

  async findAllByPromoteur(promoteur: string): Promise<Notification[]> {
    return this.notificationsRepository
      .createQueryBuilder("notifications")
      .where(":promoteur = any (notifications.promoteurs)", { promoteur })
      .orderBy("notifications.id", "DESC")
      .getMany();
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    return this.notificationsRepository.save(notification);
  }

  async update(id: number, notification: Notification): Promise<UpdateResult> {
    return this.notificationsRepository.update(id, notification);
  }

  async delete(id: number): Promise<DeleteResult> {
    return this.notificationsRepository.delete(id);
  }

  async updateManyByRole(
    role: UserRole,
    notification: Notification
  ): Promise<UpdateResult> {
    return this.notificationsRepository.update(
      { intendedRoles: role },
      notification
    );
  }
}
