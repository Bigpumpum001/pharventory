import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { UnitsService } from './units.service';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

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

describe('UnitsService', () => {
  let service: UnitsService;
  let unitRepo: MockRepo<Unit>;

  const mockUnit: Unit = {
    id: 1,
    name: 'mg',
    medicines: [],
  };

  beforeEach(async () => {
    unitRepo = createMockRepo<Unit>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UnitsService,
        { provide: getRepositoryToken(Unit), useValue: unitRepo },
      ],
    }).compile();

    service = module.get<UnitsService>(UnitsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create and return a unit when name is unique', async () => {
      const dto: CreateUnitDto = { name: '  mg  ' };

      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);
      (unitRepo.create as jest.Mock).mockReturnValue(mockUnit);
      (unitRepo.save as jest.Mock).mockResolvedValue(mockUnit);

      const result = await service.create(dto);

      expect(unitRepo.findOne).toHaveBeenCalledWith({
        where: { name: 'mg' } as FindOptionsWhere<Unit>,
      });
      expect(unitRepo.create).toHaveBeenCalledWith({ name: 'mg' });
      expect(unitRepo.save).toHaveBeenCalledWith(mockUnit);
      expect(result).toEqual(mockUnit);
    });

    it('should throw BadRequestException when name already exists', async () => {
      const dto: CreateUnitDto = { name: 'mg' };

      (unitRepo.findOne as jest.Mock).mockResolvedValue(mockUnit);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(
        `Unit with name "mg" already exists in the system`,
      );
    });
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all units ordered by name ASC', async () => {
      (unitRepo.find as jest.Mock).mockResolvedValue([mockUnit] as Unit[]);

      const result = await service.findAll();

      expect(unitRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
      expect(result).toEqual([mockUnit]);
    });

    it('should return empty array when no units exist', async () => {
      (unitRepo.find as jest.Mock).mockResolvedValue([] as Unit[]);

      const result = await service.findAll();

      expect(result).toEqual([] as Unit[]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return unit when found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(mockUnit);

      const result = await service.findOne(1);

      expect(unitRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Unit>,
      });
      expect(result).toEqual(mockUnit);
    });

    it('should throw NotFoundException when unit not found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(99)).rejects.toThrow(
        'Unit with ID 99 not found',
      );
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update and return unit when name is unique', async () => {
      const dto: UpdateUnitDto = { name: '  ml  ' };
      const updated: Unit = { ...mockUnit, name: 'ml' };

      (unitRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUnit)
        .mockResolvedValueOnce(null);
      (unitRepo.save as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(1, dto);

      expect(result).toEqual(updated);
      expect(unitRepo.save).toHaveBeenCalledWith({ ...mockUnit, name: 'ml' });
    });

    it('should throw BadRequestException when new name belongs to another unit', async () => {
      const dto: UpdateUnitDto = { name: 'ml' };

      (unitRepo.findOne as jest.Mock).mockImplementation(
        (options: { where?: Partial<Unit> }) => {
          if (options?.where?.id === 1) {
            return Promise.resolve(mockUnit);
          }

          if (options?.where?.name === 'ml') {
            return Promise.resolve({
              id: 2,
              name: 'ml',
              medicines: [],
            });
          }

          return Promise.resolve(null);
        },
      );

      await expect(service.update(1, dto)).rejects.toMatchObject({
        message: 'Unit with name "ml" already exists in the system',
      });
    });

    it('should not throw when updated name belongs to same unit', async () => {
      const dto: UpdateUnitDto = { name: 'mg' };

      (unitRepo.findOne as jest.Mock)
        .mockResolvedValueOnce(mockUnit)
        .mockResolvedValueOnce({ ...mockUnit });
      (unitRepo.save as jest.Mock).mockResolvedValue(mockUnit);

      const result = await service.update(1, dto);

      expect(result).toEqual(mockUnit);
    });

    it('should keep existing name when dto.name is undefined', async () => {
      const dto: UpdateUnitDto = {};

      (unitRepo.findOne as jest.Mock).mockResolvedValueOnce(mockUnit);
      (unitRepo.save as jest.Mock).mockResolvedValue(mockUnit);

      const result = await service.update(1, dto);

      expect(result.name).toBe('mg');
    });

    it('should throw NotFoundException when unit not found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.update(99, { name: 'ml' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should delete unit and return removed result', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(mockUnit);
      (unitRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(unitRepo.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ removed: true, id: 1 });
    });

    it('should throw NotFoundException when unit not found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      await expect(service.remove(99)).rejects.toThrow(
        'Unit with ID 99 not found',
      );
    });
  });
});
