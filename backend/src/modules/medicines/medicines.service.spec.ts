import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

import { MedicinesService } from './medicines.service';
import { Medicine } from './entities/medicine.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Category } from '../category/entities/category.entity';
import { Unit } from '../units/entities/unit.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { CreateMedicineBatchDto } from '../medicine-batches/dto/create-medicine-batch.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

const createMockRepo = <T extends ObjectLiteral>(): MockRepo<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  preload: jest.fn(),
});

const mockUnit: Unit = { id: 1, name: 'mg' } as Unit;
const mockCategory: Category = { id: 1, name: 'Painkiller' } as Category;
const mockUser: User = { id: 1 } as User;

const mockBatch: MedicineBatch = {
  id: 1,
  batchNumber: 'B001',
  quantity: 100,
  expiryDate: new Date('2099-12-31'),
  medicine: {} as Medicine,
} as MedicineBatch;

const expiredBatch: MedicineBatch = {
  id: 2,
  batchNumber: 'B002',
  quantity: 50,
  expiryDate: new Date('2000-01-01'),
  medicine: {} as Medicine,
} as MedicineBatch;

const mockMedicine: Medicine = {
  id: 1,
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  price: 10,
  supplier: 'PharmaCo',
  imageUrl: undefined,
  isActive: true,
  category: mockCategory,
  unit: mockUnit,
  batches: [mockBatch] as MedicineBatch[],
  createdBy: mockUser,
  updatedBy: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
} as Medicine;

describe('MedicinesService', () => {
  let service: MedicinesService;
  let medicineRepo: MockRepo<Medicine>;
  let medicineBatchRepo: MockRepo<MedicineBatch>;
  let cateRepo: MockRepo<Category>;
  let unitRepo: MockRepo<Unit>;
  let logRepo: MockRepo<StockLog>;
  let userRepo: MockRepo<User>;

  beforeEach(async () => {
    medicineRepo = createMockRepo<Medicine>();
    medicineBatchRepo = createMockRepo<MedicineBatch>();
    cateRepo = createMockRepo<Category>();
    unitRepo = createMockRepo<Unit>();
    logRepo = createMockRepo<StockLog>();
    userRepo = createMockRepo<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicinesService,
        { provide: getRepositoryToken(Medicine), useValue: medicineRepo },
        {
          provide: getRepositoryToken(MedicineBatch),
          useValue: medicineBatchRepo,
        },
        { provide: getRepositoryToken(Category), useValue: cateRepo },
        { provide: getRepositoryToken(Unit), useValue: unitRepo },
        { provide: getRepositoryToken(StockLog), useValue: logRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<MedicinesService>(MedicinesService);
  });

  // ─── findAllWithSummary ───────────────────────────────────────────────────

  describe('findAllWithSummary', () => {
    it('should return medicines with totalStock and nearestExpired (non-expired)', async () => {
      const medicine: Medicine = {
        ...mockMedicine,
        batches: [mockBatch] as MedicineBatch[],
      };
      (medicineRepo.find as jest.Mock).mockResolvedValue([
        medicine,
      ] as Medicine[]);

      const result = await service.findAllWithSummary(false);

      expect(result).toHaveLength(1);
      expect(result[0].totalStock).toBe(100);
      expect(result[0].nearestExpired).toEqual(mockBatch.expiryDate);
    });

    it('should include medicines with 0 stock when expired=false', async () => {
      const medicine: Medicine = {
        ...mockMedicine,
        batches: [] as MedicineBatch[],
      };
      (medicineRepo.find as jest.Mock).mockResolvedValue([
        medicine,
      ] as Medicine[]);

      const result = await service.findAllWithSummary(false);

      expect(result).toHaveLength(1);
      expect(result[0].totalStock).toBe(0);
      expect(result[0].nearestExpired).toBeNull();
    });

    it('should return only expired medicines with expired=true', async () => {
      const medicine: Medicine = {
        ...mockMedicine,
        batches: [mockBatch, expiredBatch] as MedicineBatch[],
      };
      (medicineRepo.find as jest.Mock).mockResolvedValue([
        medicine,
      ] as Medicine[]);

      const result = await service.findAllWithSummary(true);

      expect(result).toHaveLength(1);
      expect(result[0].totalStock).toBe(50);
    });

    it('should exclude medicines with no expired stock when expired=true', async () => {
      const medicine: Medicine = {
        ...mockMedicine,
        batches: [mockBatch] as MedicineBatch[],
      };
      (medicineRepo.find as jest.Mock).mockResolvedValue([
        medicine,
      ] as Medicine[]);

      const result = await service.findAllWithSummary(true);

      expect(result).toHaveLength(0);
    });
  });

  // ─── getMedicineByID ──────────────────────────────────────────────────────

  describe('getMedicineByID', () => {
    it('should return medicine by id', async () => {
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);

      const result = await service.getMedicineByID(1);

      expect(result).toEqual(mockMedicine);
      expect(medicineRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Medicine>,
        relations: ['batches', 'category', 'unit'],
      });
    });

    it('should return null when medicine not found', async () => {
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getMedicineByID(999);

      expect(result).toBeNull();
    });
  });

  // ─── createMedicine ───────────────────────────────────────────────────────

  describe('createMedicine', () => {
    const mockBatchDto = {
      batchNumber: 'B001',
      quantity: 100,
      expiryDate: new Date('2099-12-31'),
      medicineId: 0,
    } as CreateMedicineBatchDto;

    const createDto: CreateMedicineDto = {
      name: 'Paracetamol',
      categoryId: 1,
      unitId: 1,
      price: 10,
      supplier: 'PharmaCo',
      batches: [mockBatchDto],
    };

    beforeEach(() => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(mockUnit);
      (cateRepo.findOne as jest.Mock).mockResolvedValue(mockCategory);
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (medicineRepo.create as jest.Mock).mockReturnValue(mockMedicine);
      (medicineRepo.save as jest.Mock).mockResolvedValue(mockMedicine);
      (medicineBatchRepo.create as jest.Mock).mockReturnValue(mockBatch);
      (medicineBatchRepo.save as jest.Mock).mockResolvedValue(mockBatch);
      (logRepo.save as jest.Mock).mockResolvedValue({} as StockLog);
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);
    });

    it('should create medicine with batches and stock log', async () => {
      const result = await service.createMedicine(createDto, 1);

      expect(unitRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Unit>,
      });
      expect(cateRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Category>,
      });
      expect(medicineRepo.create).toHaveBeenCalled();
      expect(medicineRepo.save).toHaveBeenCalled();
      expect(medicineBatchRepo.create).toHaveBeenCalledTimes(1);
      expect(medicineBatchRepo.save).toHaveBeenCalledTimes(1);
      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'IN', quantityChange: 100 }),
      );
      expect(result).toEqual(mockMedicine);
    });

    it('should not create batches or logs when batches is empty', async () => {
      const dto: CreateMedicineDto = {
        ...createDto,
        batches: [] as CreateMedicineDto['batches'],
      };

      const result = await service.createMedicine(dto, 1);

      expect(medicineBatchRepo.create).not.toHaveBeenCalled();
      expect(logRepo.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockMedicine);
    });

    it('should not call userRepo when userId is not provided', async () => {
      const dto: CreateMedicineDto = {
        ...createDto,
        batches: [] as CreateMedicineDto['batches'],
      };

      await service.createMedicine(dto);

      expect(userRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when unit not found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.createMedicine(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      (cateRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.createMedicine(createDto, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── updateMedicine ───────────────────────────────────────────────────────

  describe('updateMedicine', () => {
    const updateDto: UpdateMedicineDto = {
      name: 'Updated',
      unitId: 1,
      categoryId: 1,
    };

    beforeEach(() => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(mockUnit);
      (cateRepo.findOne as jest.Mock).mockResolvedValue(mockCategory);
      (medicineRepo.preload as jest.Mock).mockResolvedValue(mockMedicine);
      (medicineRepo.save as jest.Mock).mockResolvedValue(mockMedicine);
    });

    it('should update and return medicine', async () => {
      const result = await service.updateMedicine(1, updateDto);

      expect(unitRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Unit>,
      });
      expect(cateRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Category>,
      });
      expect(medicineRepo.preload).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, name: 'Updated' }),
      );
      expect(medicineRepo.save).toHaveBeenCalledWith(mockMedicine);
      expect(result).toEqual(mockMedicine);
    });

    it('should skip unit/category lookup when ids not provided', async () => {
      const dto: UpdateMedicineDto = { name: 'NameOnly' };
      (medicineRepo.preload as jest.Mock).mockResolvedValue(mockMedicine);

      await service.updateMedicine(1, dto);

      expect(unitRepo.findOne).not.toHaveBeenCalled();
      expect(cateRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when unit not found', async () => {
      (unitRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.updateMedicine(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when category not found', async () => {
      (cateRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.updateMedicine(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when medicine not found via preload', async () => {
      (medicineRepo.preload as jest.Mock).mockResolvedValue(null);

      await expect(service.updateMedicine(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── removeMedicine ───────────────────────────────────────────────────────

  describe('removeMedicine', () => {
    it('should delete medicine when totalStock is 0', async () => {
      const noStock: Medicine = {
        ...mockMedicine,
        batches: [{ ...mockBatch, quantity: 0 }] as MedicineBatch[],
      };
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(noStock);
      (medicineRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await expect(service.removeMedicine(1)).resolves.toBeUndefined();
      expect(medicineRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw when medicine not found', async () => {
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.removeMedicine(999)).rejects.toThrow(
        'Medicine not found',
      );
      expect(medicineRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw when medicine has stock > 0', async () => {
      (medicineRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);

      await expect(service.removeMedicine(1)).rejects.toThrow(
        'Cannot delete medicine with stock',
      );
      expect(medicineRepo.delete).not.toHaveBeenCalled();
    });
  });
});
