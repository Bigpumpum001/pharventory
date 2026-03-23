import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { StockLogsService } from './stock-logs.service';
import { StockLog } from './entities/stock-log.entity';

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

const mockLog: StockLog = {
  id: 1,
  action: 'IN',
  quantityChange: 50,
  note: 'Initial stock',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  medicineBatch: {
    id: 100,
    batchNumber: 'BATCH-001',
    quantity: 50,
    expiryDate: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    medicine: {
      id: 10,
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      imageUrl: 'https://cdn.example.com/para.png',
      price: 10,
      supplier: 'ABC Pharma',
      isActive: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      category:
        null as unknown as StockLog['medicineBatch']['medicine']['category'],
      unit: null as unknown as StockLog['medicineBatch']['medicine']['unit'],
      createdBy:
        null as unknown as StockLog['medicineBatch']['medicine']['createdBy'],
      updatedBy:
        null as unknown as StockLog['medicineBatch']['medicine']['updatedBy'],
      batches: [] as StockLog['medicineBatch']['medicine']['batches'],
    },
  },
  createdBy: {
    id: 1,
    username: 'nurse01',
    passwordHash: 'hash',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    role: null as unknown as StockLog['createdBy']['role'],
    stockLogs: [] as StockLog['createdBy']['stockLogs'],
    receipt: [] as StockLog['createdBy']['receipt'],
    createdMedicines: [] as StockLog['createdBy']['createdMedicines'],
    updatedMedicines: [] as StockLog['createdBy']['updatedMedicines'],
  },
};

describe('StockLogsService', () => {
  let service: StockLogsService;
  let logRepo: MockRepo<StockLog>;

  beforeEach(async () => {
    logRepo = createMockRepo<StockLog>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockLogsService,
        { provide: getRepositoryToken(StockLog), useValue: logRepo },
      ],
    }).compile();

    service = module.get<StockLogsService>(StockLogsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAllLogs', () => {
    it('should return mapped StockLogDto array', async () => {
      (logRepo.find as jest.Mock).mockResolvedValue([mockLog] as StockLog[]);

      const result = await service.findAllLogs();

      expect(logRepo.find).toHaveBeenCalledWith({
        relations: ['medicineBatch', 'createdBy', 'medicineBatch.medicine'],
        order: { id: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        action: 'IN',
        quantityChange: 50,
        note: 'Initial stock',
        createdAt: mockLog.createdAt,
        medicineBatch: {
          name: 'Paracetamol',
          batchNumber: 'BATCH-001',
          imageUrl: 'https://cdn.example.com/para.png',
        },
        createdBy: 'nurse01',
      });
    });

    it('should set createdBy to null when createdBy is null', async () => {
      const log: StockLog = {
        ...mockLog,
        createdBy: null as unknown as StockLog['createdBy'],
      };
      (logRepo.find as jest.Mock).mockResolvedValue([log] as StockLog[]);

      const result = await service.findAllLogs();

      expect(result[0].createdBy).toBeNull();
    });

    it('should map imageUrl as undefined when medicine.imageUrl is undefined', async () => {
      const log: StockLog = {
        ...mockLog,
        medicineBatch: {
          ...mockLog.medicineBatch,
          medicine: { ...mockLog.medicineBatch.medicine, imageUrl: undefined },
        },
      };
      (logRepo.find as jest.Mock).mockResolvedValue([log] as StockLog[]);

      const result = await service.findAllLogs();

      expect(result[0].medicineBatch.imageUrl).toBeUndefined();
    });

    it('should return empty array when no logs exist', async () => {
      (logRepo.find as jest.Mock).mockResolvedValue([] as StockLog[]);

      const result = await service.findAllLogs();

      expect(result).toEqual([] as typeof result);
    });

    it('should propagate repository errors', async () => {
      (logRepo.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.findAllLogs()).rejects.toThrow('DB error');
    });
  });

  describe('findLogsByBatch', () => {
    it('should query by batchId with correct where clause and return logs', async () => {
      (logRepo.find as jest.Mock).mockResolvedValue([mockLog] as StockLog[]);

      const result = await service.findLogsByBatch(100);

      expect(logRepo.find).toHaveBeenCalledWith({
        where: { medicineBatch: { id: 100 } } as FindOptionsWhere<StockLog>,
        relations: ['medicineBatch', 'createdBy'],
      });
      expect(result).toEqual([mockLog] as StockLog[]);
    });

    it('should return empty array when batch has no logs', async () => {
      (logRepo.find as jest.Mock).mockResolvedValue([] as StockLog[]);

      const result = await service.findLogsByBatch(999);

      expect(result).toEqual([] as StockLog[]);
    });

    it('should propagate repository errors', async () => {
      (logRepo.find as jest.Mock).mockRejectedValue(new Error('DB timeout'));

      await expect(service.findLogsByBatch(1)).rejects.toThrow('DB timeout');
    });
  });
});
