import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { MedicineBatchesService } from './medicine-batches.service';
import { MedicineBatch } from './entities/medicine-batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

type MockRepo<T extends ObjectLiteral> = Partial<jest.Mocked<Repository<T>>>;

function createMockRepo<T extends ObjectLiteral>(): MockRepo<T> {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };
}

describe('MedicineBatchesService', () => {
  let service: MedicineBatchesService;
  let batchRepo: MockRepo<MedicineBatch>;
  let medRepo: MockRepo<Medicine>;
  let logRepo: MockRepo<StockLog>;
  let userRepo: MockRepo<User>;

  const mockMedicine: Medicine = {
    id: 1,
    name: 'Paracetamol',
    batches: [],
  } as unknown as Medicine;

  const mockUser: User = { id: 42 } as unknown as User;

  const mockBatch: MedicineBatch = {
    id: 1,
    batchNumber: 'B001',
    quantity: 100,
    expiryDate: new Date('2026-12-31'),
    medicine: mockMedicine,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as MedicineBatch;

  beforeEach(async () => {
    batchRepo = createMockRepo<MedicineBatch>();
    medRepo = createMockRepo<Medicine>();
    logRepo = createMockRepo<StockLog>();
    userRepo = createMockRepo<User>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicineBatchesService,
        { provide: getRepositoryToken(MedicineBatch), useValue: batchRepo },
        { provide: getRepositoryToken(Medicine), useValue: medRepo },
        { provide: getRepositoryToken(StockLog), useValue: logRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<MedicineBatchesService>(MedicineBatchesService);
  });

  // ─── findAllBatch ───────────────────────────────────────────────────────────

  describe('findAllBatch', () => {
    it('should return mapped batch list', async () => {
      (batchRepo.find as jest.Mock).mockResolvedValue([mockBatch]);

      const result = await service.findAllBatch();

      expect(batchRepo.find).toHaveBeenCalledWith({ relations: ['medicine'] });
      expect(result).toEqual([
        {
          id: mockBatch.id,
          medicineName: mockMedicine.name,
          batchNumber: mockBatch.batchNumber,
          quantity: mockBatch.quantity,
          expiryDate: mockBatch.expiryDate,
          createdAt: mockBatch.createdAt,
          updatedAt: mockBatch.updatedAt,
          medicineId: mockMedicine.id,
        },
      ]);
    });

    it('should return empty array when no batches exist', async () => {
      (batchRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await service.findAllBatch();

      expect(result).toEqual([]);
    });
  });

  // ─── createBatch ────────────────────────────────────────────────────────────

  describe('createBatch', () => {
    const dto = {
      batchNumber: 'B001',
      quantity: 50,
      expiryDate: new Date('2026-12-31'),
      medicineId: 1,
    };

    it('should create batch and log when medicine found and userId provided', async () => {
      (medRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);
      (batchRepo.create as jest.Mock).mockReturnValue(mockBatch);
      (batchRepo.save as jest.Mock).mockResolvedValue(mockBatch);
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (logRepo.save as jest.Mock).mockResolvedValue({});

      const result = await service.createBatch(dto, 42);

      expect(medRepo.findOne).toHaveBeenCalledWith({
        where: { id: dto.medicineId },
      });
      expect(batchRepo.create).toHaveBeenCalledWith({
        batchNumber: dto.batchNumber,
        quantity: dto.quantity,
        expiryDate: dto.expiryDate,
        medicine: mockMedicine,
      });
      expect(batchRepo.save).toHaveBeenCalledWith(mockBatch);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
      expect(logRepo.save).toHaveBeenCalledWith({
        medicineBatch: mockBatch,
        quantityChange: dto.quantity,
        action: 'IN',
        note: 'New batch',
        createdBy: mockUser,
      });
      expect(result).toBe(mockBatch);
    });

    it('should create batch without user when userId not provided', async () => {
      (medRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);
      (batchRepo.create as jest.Mock).mockReturnValue(mockBatch);
      (batchRepo.save as jest.Mock).mockResolvedValue(mockBatch);
      (logRepo.save as jest.Mock).mockResolvedValue({});

      await service.createBatch(dto);

      expect(userRepo.findOne).not.toHaveBeenCalled();
      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: undefined }),
      );
    });

    it('should create batch with undefined user when userId not found in DB', async () => {
      (medRepo.findOne as jest.Mock).mockResolvedValue(mockMedicine);
      (batchRepo.create as jest.Mock).mockReturnValue(mockBatch);
      (batchRepo.save as jest.Mock).mockResolvedValue(mockBatch);
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      (logRepo.save as jest.Mock).mockResolvedValue({});

      await service.createBatch(dto, 999);

      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: undefined }),
      );
    });

    it('should throw when medicine not found', async () => {
      (medRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.createBatch(dto)).rejects.toThrow(
        'Medicine not found',
      );
      expect(batchRepo.create).not.toHaveBeenCalled();
    });
  });

  // ─── updateBatch ────────────────────────────────────────────────────────────

  describe('updateBatch', () => {
    it('should update batch and log increase when quantity increases', async () => {
      const updatedBatch = { ...mockBatch, quantity: 150 } as MedicineBatch;
      (batchRepo.findOne as jest.Mock).mockResolvedValue({ ...mockBatch });
      (batchRepo.save as jest.Mock).mockResolvedValue(updatedBatch);
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (logRepo.save as jest.Mock).mockResolvedValue({});

      const result = await service.updateBatch(1, { quantity: 150 }, 42);

      expect(batchRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['medicine'],
      });
      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          quantityChange: 50,
          action: 'IN,ADJUST',
          note: 'Increase: 100 → 150',
          createdBy: mockUser,
        }),
      );
      expect(result).toMatchObject({ id: mockBatch.id });
    });

    it('should log decrease when quantity decreases', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue({ ...mockBatch });
      (batchRepo.save as jest.Mock).mockResolvedValue({
        ...mockBatch,
        quantity: 60,
      });
      (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
      (logRepo.save as jest.Mock).mockResolvedValue({});

      await service.updateBatch(1, { quantity: 60 }, 42);

      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          quantityChange: 40,
          action: 'OUT,ADJUST',
          note: 'Decrease: 100 → 60',
        }),
      );
    });

    it('should not log when quantity unchanged', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue({ ...mockBatch });
      (batchRepo.save as jest.Mock).mockResolvedValue(mockBatch);

      await service.updateBatch(1, { quantity: 100 }, 42);

      expect(logRepo.save).not.toHaveBeenCalled();
    });

    it('should not log when quantity field is absent from dto', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue({ ...mockBatch });
      (batchRepo.save as jest.Mock).mockResolvedValue(mockBatch);

      await service.updateBatch(1, { batchNumber: 'B999' }, 42);

      expect(logRepo.save).not.toHaveBeenCalled();
    });

    it('should throw when batch not found', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.updateBatch(99, { quantity: 10 })).rejects.toThrow(
        'Batch not found',
      );
    });

    it('should update without user when userId not provided', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue({ ...mockBatch });
      (batchRepo.save as jest.Mock).mockResolvedValue({
        ...mockBatch,
        quantity: 200,
      });
      (logRepo.save as jest.Mock).mockResolvedValue({});

      await service.updateBatch(1, { quantity: 200 });

      expect(userRepo.findOne).not.toHaveBeenCalled();
      expect(logRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: undefined }),
      );
    });
  });

  // ─── removeBatch ────────────────────────────────────────────────────────────

  describe('removeBatch', () => {
    it('should delete batch when quantity is 0', async () => {
      const zeroBatch = { ...mockBatch, quantity: 0 } as MedicineBatch;
      (batchRepo.findOne as jest.Mock).mockResolvedValue(zeroBatch);
      (batchRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      await service.removeBatch(1);

      expect(batchRepo.delete).toHaveBeenCalledWith(1);
    });

    it('should throw when batch not found', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.removeBatch(99)).rejects.toThrow('Batch not found');
      expect(batchRepo.delete).not.toHaveBeenCalled();
    });

    it('should throw when batch still has stock', async () => {
      (batchRepo.findOne as jest.Mock).mockResolvedValue(mockBatch); // quantity = 100

      await expect(service.removeBatch(1)).rejects.toThrow(
        'Cannot delete batch with stock',
      );
      expect(batchRepo.delete).not.toHaveBeenCalled();
    });
  });
});
