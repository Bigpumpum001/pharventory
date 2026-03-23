import { Test, TestingModule } from '@nestjs/testing';
import { MedicinesController } from './medicines.controller';
import { MedicinesService } from './medicines.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { Medicine } from './entities/medicine.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

// ─── AuthenticatedRequest type ────────────────────────────────────────────────
// Derive the exact type from the controller method signature — avoids importing
// the private interface and avoids any/unknown casts.
type AuthReq = Parameters<MedicinesController['create']>[1];

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockBatch: MedicineBatch = {
  id: 1,
  batchNumber: 'B001',
  quantity: 100,
  expiryDate: new Date('2099-12-31'),
} as MedicineBatch;

const mockMedicine: Medicine = {
  id: 1,
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  price: 10,
  isActive: true,
  batches: [mockBatch] as MedicineBatch[],
} as Medicine;

const mockMedicineWithSummary = {
  ...mockMedicine,
  totalStock: 100,
  nearestExpired: mockBatch.expiryDate,
};

// ─── Mock service ─────────────────────────────────────────────────────────────

const mockMedicinesService = {
  findAllWithSummary: jest.fn(),
  getMedicineByID: jest.fn(),
  createMedicine: jest.fn(),
  updateMedicine: jest.fn(),
  removeMedicine: jest.fn(),
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeAuthRequest(sub: number): AuthReq {
  return { user: { sub } as JwtPayload } as AuthReq;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MedicinesController', () => {
  let controller: MedicinesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicinesController],
      providers: [
        { provide: MedicinesService, useValue: mockMedicinesService },
      ],
    }).compile();

    controller = module.get<MedicinesController>(MedicinesController);
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service with expired=false when query is "false"', async () => {
      mockMedicinesService.findAllWithSummary.mockResolvedValue([
        mockMedicineWithSummary,
      ]);

      const result = await controller.findAll('false');

      expect(mockMedicinesService.findAllWithSummary).toHaveBeenCalledWith(
        false,
      );
      expect(result).toEqual([mockMedicineWithSummary]);
    });

    it('should call service with expired=true when query is "true"', async () => {
      mockMedicinesService.findAllWithSummary.mockResolvedValue(
        [] as (typeof mockMedicineWithSummary)[],
      );

      await controller.findAll('true');

      expect(mockMedicinesService.findAllWithSummary).toHaveBeenCalledWith(
        true,
      );
    });

    it('should treat any non-"true" string as expired=false', async () => {
      mockMedicinesService.findAllWithSummary.mockResolvedValue([
        mockMedicineWithSummary,
      ]);

      await controller.findAll('');

      expect(mockMedicinesService.findAllWithSummary).toHaveBeenCalledWith(
        false,
      );
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return medicine by id', async () => {
      mockMedicinesService.getMedicineByID.mockResolvedValue(mockMedicine);

      const result = await controller.findOne('1');

      expect(mockMedicinesService.getMedicineByID).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMedicine);
    });

    it('should return null when medicine not found', async () => {
      mockMedicinesService.getMedicineByID.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result).toBeNull();
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto: CreateMedicineDto = {
      name: 'Paracetamol',
      categoryId: 1,
      unitId: 1,
      batches: [] as CreateMedicineDto['batches'],
    };

    it('should create medicine with userId from JWT', async () => {
      const req = makeAuthRequest(42);
      mockMedicinesService.createMedicine.mockResolvedValue(mockMedicine);

      const result = await controller.create(createDto, req);

      expect(mockMedicinesService.createMedicine).toHaveBeenCalledWith(
        createDto,
        42,
      );
      expect(result).toEqual(mockMedicine);
    });

    it('should propagate error from service', async () => {
      const req = makeAuthRequest(42);
      mockMedicinesService.createMedicine.mockRejectedValue(
        new Error('Unit not found'),
      );

      await expect(controller.create(createDto, req)).rejects.toThrow(
        'Unit not found',
      );
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    const updateDto: UpdateMedicineDto = { name: 'Updated' };

    it('should update and return medicine', async () => {
      mockMedicinesService.updateMedicine.mockResolvedValue(mockMedicine);

      const result = await controller.update('1', updateDto);

      expect(mockMedicinesService.updateMedicine).toHaveBeenCalledWith(
        1,
        updateDto,
      );
      expect(result).toEqual(mockMedicine);
    });

    it('should propagate error from service', async () => {
      mockMedicinesService.updateMedicine.mockRejectedValue(
        new Error('Medicine not found'),
      );

      await expect(controller.update('999', updateDto)).rejects.toThrow(
        'Medicine not found',
      );
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should remove medicine successfully', async () => {
      mockMedicinesService.removeMedicine.mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(mockMedicinesService.removeMedicine).toHaveBeenCalledWith(1);
    });

    it('should propagate error when medicine has stock', async () => {
      mockMedicinesService.removeMedicine.mockRejectedValue(
        new Error('Cannot delete medicine with stock'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        'Cannot delete medicine with stock',
      );
    });
  });
});
