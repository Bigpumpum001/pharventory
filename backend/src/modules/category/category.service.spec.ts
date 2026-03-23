import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ObjectLiteral } from 'typeorm';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

const createMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
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

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepo: MockRepo<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepo<Category>(),
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    categoryRepo = module.get<MockRepo<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const dto: CreateCategoryDto = {
      name: '  Antibiotic  ',
      description: '  ยาปฏิชีวนะ  ',
    };

    it('should create and return a new category', async () => {
      const saved = mockCategory({
        name: 'Antibiotic',
        description: 'ยาปฏิชีวนะ',
      });

      categoryRepo.findOne!.mockResolvedValue(null);
      categoryRepo.create!.mockReturnValue(saved);
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'Antibiotic' } as FindOptionsWhere<Category>,
      });
      expect(categoryRepo.create).toHaveBeenCalledWith({
        name: 'Antibiotic',
        description: 'ยาปฏิชีวนะ',
      });
      expect(categoryRepo.save).toHaveBeenCalledWith(saved);
      expect(result).toEqual(saved);
    });

    it('should create category without description', async () => {
      const dtoNoDesc: CreateCategoryDto = { name: 'Steroid' };
      const saved = mockCategory({ name: 'Steroid', description: undefined });

      categoryRepo.findOne!.mockResolvedValue(null);
      categoryRepo.create!.mockReturnValue(saved);
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.create(dtoNoDesc);
      expect(result).toEqual(saved);
    });

    it('should throw BadRequestException if name already exists', async () => {
      categoryRepo.findOne!.mockResolvedValue(
        mockCategory({ name: 'Antibiotic' }),
      );

      await expect(service.create(dto)).rejects.toThrow(
        new BadRequestException(
          'Category with name "  Antibiotic  " already exists in the system',
        ),
      );
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all active categories ordered by name', async () => {
      const categories: Category[] = [
        mockCategory({ id: 1, name: 'Analgesic' }),
        mockCategory({ id: 2, name: 'Antipyretic' }),
      ];
      categoryRepo.find!.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(categoryRepo.find).toHaveBeenCalledWith({
        where: { isActive: true } as FindOptionsWhere<Category>,
        order: { name: 'ASC' },
      });
      expect(result).toEqual(categories);
    });

    it('should return empty array when no active categories exist', async () => {
      categoryRepo.find!.mockResolvedValue([] as Category[]);

      const result = await service.findAll();
      expect(result).toEqual([] as Category[]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const category = mockCategory({ id: 3, name: 'NSAIDs' });
      categoryRepo.findOne!.mockResolvedValue(category);

      const result = await service.findOne(3);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({
        where: { id: 3 } as FindOptionsWhere<Category>,
      });
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when category not found', async () => {
      categoryRepo.findOne!.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Category with ID 999 not found'),
      );
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    const dto: UpdateCategoryDto = {
      name: '  Painkiller  ',
      description: '  pain relief  ',
    };

    it('should update name and description successfully', async () => {
      const existing = mockCategory({ id: 1, name: 'Analgesic' });
      const saved = mockCategory({
        id: 1,
        name: 'Painkiller',
        description: 'pain relief',
      });

      categoryRepo
        .findOne!.mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(null);
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.update(1, dto);

      expect(categoryRepo.save).toHaveBeenCalled();
      expect(result).toEqual(saved);
    });

    it('should update description only (no name in dto)', async () => {
      const existing = mockCategory({ id: 1, name: 'Analgesic' });
      const dtoDescOnly: UpdateCategoryDto = { description: 'updated desc' };
      const saved = mockCategory({
        id: 1,
        name: 'Analgesic',
        description: 'updated desc',
      });

      categoryRepo.findOne!.mockResolvedValueOnce(existing);
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.update(1, dtoDescOnly);
      expect(result).toEqual(saved);
    });

    it('should allow same name update on the same category (no duplicate error)', async () => {
      const existing = mockCategory({ id: 1, name: 'Analgesic' });
      const dtoSameName: UpdateCategoryDto = { name: 'Analgesic' };
      const saved = mockCategory({ id: 1, name: 'Analgesic' });

      categoryRepo
        .findOne!.mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(existing); // same id → not a conflict
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.update(1, dtoSameName);
      expect(result).toEqual(saved);
    });

    it('should throw BadRequestException if new name belongs to another category', async () => {
      const existing = mockCategory({ id: 1, name: 'Analgesic' });
      const conflicting = mockCategory({ id: 2, name: 'Antipyretic' });
      const dtoConflict: UpdateCategoryDto = { name: 'Antipyretic' };

      categoryRepo
        .findOne!.mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(conflicting);

      await expect(service.update(1, dtoConflict)).rejects.toThrow(
        new BadRequestException(
          'Category with name "Antipyretic" already exists in the system',
        ),
      );
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when category id not found', async () => {
      categoryRepo.findOne!.mockResolvedValue(null);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(
        new NotFoundException('Category with ID 999 not found'),
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete a category by setting isActive to false', async () => {
      const category = mockCategory({ id: 1, isActive: true });
      const saved = mockCategory({ id: 1, isActive: false });

      categoryRepo.findOne!.mockResolvedValue(category);
      categoryRepo.save!.mockResolvedValue(saved);

      const result = await service.remove(1);

      expect(categoryRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, isActive: false }),
      );
      expect(result).toEqual(saved);
    });

    it('should throw NotFoundException when category id not found', async () => {
      categoryRepo.findOne!.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Category with ID 999 not found'),
      );
      expect(categoryRepo.save).not.toHaveBeenCalled();
    });
  });
});
