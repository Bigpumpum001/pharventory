import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  async findAllRoles() {
    return await this.roleRepo.find();
  }

  async findRolesbyID(id: number) {
    return await this.roleRepo.findOne({ where: { id } });
  }
}
