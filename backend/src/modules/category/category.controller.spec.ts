import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const mockCategoryService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Analgesic',
  description: 'ยาแก้ปวด',
  isActive: true,
  createdAt: new Date('2025-11-29T17:49:06.245Z'),
  updatedAt: new Date('2025-11-29T17:49:06.245Z'),
  medicines: [] as Medicine[],
  ...overrides,
});

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: ReturnType<typeof mockCategoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useFactory: mockCategoryService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get(CategoryService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreateCategoryDto = {
      name: 'Antibiotic',
      description: 'ยาปฏิชีวนะ',
    };

    it('should return the created category', async () => {
      const created = mockCategory({
        name: 'Antibiotic',
        description: 'ยาปฏิชีวนะ',
      });
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should propagate BadRequestException from service', async () => {
      service.create.mockRejectedValue(
        new BadRequestException(
          'Category with name "Antibiotic" already exists in the system',
        ),
      );

      await expect(controller.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return array of active categories', async () => {
      const categories: Category[] = [
        mockCategory({ id: 1, name: 'Analgesic' }),
        mockCategory({ id: 2, name: 'Antipyretic' }),
      ];
      service.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });

    it('should return empty array when no categories exist', async () => {
      service.findAll.mockResolvedValue([] as Category[]);

      const result = await controller.findAll();
      expect(result).toEqual([] as Category[]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = mockCategory({ id: 3, name: 'NSAIDs' });
      service.findOne.mockResolvedValue(category);

      const result = await controller.findOne('3');

      expect(service.findOne).toHaveBeenCalledWith(3);
      expect(result).toEqual(category);
    });

    it('should propagate NotFoundException from service', async () => {
      service.findOne.mockRejectedValue(
        new NotFoundException('Category with ID 999 not found'),
      );

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto: UpdateCategoryDto = {
      name: 'Painkiller',
      description: 'pain relief',
    };

    it('should return the updated category', async () => {
      const updated = mockCategory({
        id: 1,
        name: 'Painkiller',
        description: 'pain relief',
      });
      service.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      service.update.mockRejectedValue(
        new NotFoundException('Category with ID 999 not found'),
      );

      await expect(controller.update('999', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate BadRequestException when name conflicts', async () => {
      service.update.mockRejectedValue(
        new BadRequestException(
          'Category with name "Painkiller" already exists in the system',
        ),
      );

      await expect(controller.update('1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call service.remove with parsed id and return result', async () => {
      const softDeleted = mockCategory({ id: 1, isActive: false });
      service.remove.mockResolvedValue(softDeleted);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(softDeleted);
    });

    it('should propagate NotFoundException from service', async () => {
      service.remove.mockRejectedValue(
        new NotFoundException('Category with ID 999 not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
