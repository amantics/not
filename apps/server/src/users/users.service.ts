import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(options?: FindManyOptions<User>) {
    return this.usersRepository.find(options);
  }

  async findOne(filter: FindOneOptions<User>) {
    return this.usersRepository.findOne(filter);
  }

  async findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  async create(user: Partial<User>) {
    const record = this.usersRepository.create(user);
    return this.usersRepository.save(record);
  }

  async update(user: User) {
    return this.usersRepository.save(user);
  }

  public parseUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      notificationsReadDate: user.notificationsReadDate,
      walletAddress: user.walletAddress,
      hasTempAddress: user.hasTempAddress,
    };
  }

  async delete(id: number) {
    return this.usersRepository.delete(id);
  }

  async count() {
    return this.usersRepository.count();
  }

  async findById(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  async findOneByAddress(walletAddress: string) {
    return this.usersRepository.findOneBy({ walletAddress });
  }
}
