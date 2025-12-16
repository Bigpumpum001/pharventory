import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    const { name } = createUnitDto;

    const existing = await this.unitRepo.findOne({
      where: { name: name.trim() },
    });
    if (existing) {
      throw new BadRequestException(
        `Unit with name "${name}" already exists in the system`,
      );
    }

    const unit = this.unitRepo.create({ name: name.trim() });
    return this.unitRepo.save(unit);
  }

  async findAll() {
    return this.unitRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const unit = await this.unitRepo.findOne({ where: { id } });
    if (!unit) throw new NotFoundException(`Unit with ID ${id} not found`);
    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const unit = await this.findOne(id);

    if (updateUnitDto.name) {
      const existing = await this.unitRepo.findOne({
        where: { name: updateUnitDto.name.trim() },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          `Unit with name "${updateUnitDto.name}" already exists in the system`,
        );
      }
    }

    unit.name = updateUnitDto.name ? updateUnitDto.name.trim() : unit.name;
    return this.unitRepo.save(unit);
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    await this.unitRepo.delete(id);
    return { removed: true, id: unit.id };
  }
}
