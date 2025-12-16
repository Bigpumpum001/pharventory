import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;
    // Check if category with same name already exists
    const existingCategory = await this.categoryRepo.findOne({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      throw new BadRequestException(
        `Category with name "${name}" already exists in the system`,
      );
    }

    const category = this.categoryRepo.create({
      name: name.trim(),
      description: description?.trim(),
    });

    return this.categoryRepo.save(category);
  }

  async findAll() {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    // If name is being updated, check for duplicates
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryRepo.findOne({
        where: { name: updateCategoryDto.name.trim() },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException(
          `Category with name "${updateCategoryDto.name}" already exists in the system`,
        );
      }
    }

    Object.assign(category, {
      name: updateCategoryDto.name
        ? updateCategoryDto.name.trim()
        : category.name,
      description: updateCategoryDto.description
        ? updateCategoryDto.description.trim()
        : category.description,
    });

    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);

    // Soft delete - set isActive to false
    category.isActive = false;
    return this.categoryRepo.save(category);
  }
}
