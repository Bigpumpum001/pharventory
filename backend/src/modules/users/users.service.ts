import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}
  async createUser(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    let role: Role | null = null;
    if (data.role) {
      role = await this.roleRepo.findOne({ where: { id: data.role } });
    }
    const user = this.userRepo.create({
      username: data.username,
      passwordHash: hashedPassword,
      role: role ?? undefined,
    });
    return this.userRepo.save(user);
  }
  async findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username: username } });
  }
  async findAllUser() {
    return await this.userRepo.find({ relations: ['role'] });
  }

  async findOne(id: number) {
    return await this.userRepo.findOne({ where: { id }, relations: ['role'] });
  }
}
