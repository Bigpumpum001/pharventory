import { Test, TestingModule } from '@nestjs/testing';
import { MedicineBatchesController } from './medicine-batches.controller';
import { MedicineBatchesService } from './medicine-batches.service';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { UpdateMedicineBatchDto } from './dto/update-medicine-batch.dto';
import { MedicineBatch } from './entities/medicine-batch.entity';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

const mockReq = {
  user: { sub: 42 } as JwtPayload,
} as unknown as AuthenticatedRequest;

describe('MedicineBatchesController', () => {
  let controller: MedicineBatchesController;
  let findAllBatch: jest.Mock;
  let createBatch: jest.Mock;
  let updateBatch: jest.Mock;
  let removeBatch: jest.Mock;

  const mockBatchList = [
    {
      id: 1,
      medicineName: 'Paracetamol',
      batchNumber: 'B001',
      quantity: 100,
      expiryDate: new Date('2026-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      medicineId: 1,
    },
  ];

  const mockBatch = {
    id: 1,
    batchNumber: 'B001',
    quantity: 100,
    expiryDate: new Date('2026-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    medicineId: 1,
  };

  beforeEach(async () => {
    findAllBatch = jest.fn();
    createBatch = jest.fn();
    updateBatch = jest.fn();
    removeBatch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicineBatchesController],
      providers: [
        {
          provide: MedicineBatchesService,
          useValue: { findAllBatch, createBatch, updateBatch, removeBatch },
        },
      ],
    }).compile();

    controller = module.get<MedicineBatchesController>(
      MedicineBatchesController,
    );
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return batch list from service', async () => {
      findAllBatch.mockResolvedValue(mockBatchList);

      const result = await controller.findAll();

      expect(findAllBatch).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockBatchList);
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call createBatch with dto and user sub', async () => {
      const dto: CreateMedicineBatchDto = {
        batchNumber: 'B001',
        quantity: 50,
        expiryDate: new Date('2026-12-31'),
        medicineId: 1,
      };
      createBatch.mockResolvedValue(mockBatch as unknown as MedicineBatch);

      const result = await controller.create(dto, mockReq);

      expect(createBatch).toHaveBeenCalledWith(dto, 42);
      expect(result).toBe(mockBatch);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call updateBatch with numeric id, dto and user sub', async () => {
      const dto: UpdateMedicineBatchDto = { quantity: 200 };
      updateBatch.mockResolvedValue(mockBatch);

      const result = await controller.update('1', dto, mockReq);

      expect(updateBatch).toHaveBeenCalledWith(1, dto, 42);
      expect(result).toBe(mockBatch);
    });

    it('should coerce string id to number', async () => {
      updateBatch.mockResolvedValue(mockBatch);

      await controller.update('99', {}, mockReq);

      expect(updateBatch).toHaveBeenCalledWith(99, {}, 42);
    });
  });

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call removeBatch with numeric id', async () => {
      removeBatch.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(removeBatch).toHaveBeenCalledWith(1);
    });

    it('should coerce string id to number', async () => {
      removeBatch.mockResolvedValue(undefined);

      await controller.remove('55');

      expect(removeBatch).toHaveBeenCalledWith(55);
    });
  });
});
