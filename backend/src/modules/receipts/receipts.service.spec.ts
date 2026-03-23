import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

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

const mockMedicine: Medicine = {
  id: 1,
  name: 'Paracetamol',
} as Medicine;

const mockBatch: MedicineBatch = {
  id: 10,
  batchNumber: 'B001',
  quantity: 100,
  expiryDate: new Date('2026-12-31'),
  createdAt: new Date(),
  updatedAt: new Date(),
  medicine: mockMedicine,
} as MedicineBatch;

const mockUser: User = {
  id: 1,
  username: 'nurse01',
} as User;

const mockItem: ReceiptItem = {
  id: 1,
  medicineBatch: mockBatch,
  quantity: 2,
  price: 50,
  createdAt: new Date(),
} as ReceiptItem;

const mockReceipt: Receipt = {
  id: 1,
  user: mockUser,
  patientName: 'John Doe',
  totalItems: 1,
  note: 'test note',
  createdAt: new Date(),
  items: [mockItem],
} as Receipt;

describe('ReceiptsService', () => {
  let service: ReceiptsService;
  let receiptRepo: MockRepo<Receipt>;
  let userRepo: MockRepo<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptsService,
        {
          provide: getRepositoryToken(Receipt),
          useValue: createMockRepo<Receipt>(),
        },
        {
          provide: getRepositoryToken(ReceiptItem),
          useValue: createMockRepo<ReceiptItem>(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepo<User>() },
      ],
    }).compile();

    service = module.get<ReceiptsService>(ReceiptsService);
    receiptRepo = module.get(getRepositoryToken(Receipt));
    userRepo = module.get(getRepositoryToken(User));
  });

  describe('findAllReceipt', () => {
    it('should return mapped receipt list', async () => {
      (receiptRepo.find as jest.Mock).mockResolvedValue([
        mockReceipt,
      ] as Receipt[]);

      const result = await service.findAllReceipt();

      expect(receiptRepo.find).toHaveBeenCalledWith({
        relations: [
          'user',
          'items',
          'items.medicineBatch',
          'items.medicineBatch.medicine',
        ],
        order: { id: 'DESC' },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockReceipt.id);
      expect(result[0].userName).toBe(mockUser.username);
      expect(result[0].patientName).toBe(mockReceipt.patientName);
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].medicineBatch.medicineName).toBe(
        mockMedicine.name,
      );
    });

    it('should return empty array when no receipts', async () => {
      (receiptRepo.find as jest.Mock).mockResolvedValue([] as Receipt[]);

      const result = await service.findAllReceipt();

      expect(result).toEqual([] as typeof result);
    });

    it('should throw when repo throws', async () => {
      (receiptRepo.find as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.findAllReceipt()).rejects.toThrow('DB error');
    });
  });

  describe('getReceiptByID', () => {
    it('should return receipt by id', async () => {
      (receiptRepo.findOne as jest.Mock).mockResolvedValue(mockReceipt);

      const result = await service.getReceiptByID(1);

      expect(receiptRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 } as FindOptionsWhere<Receipt>,
        relations: [
          'items',
          'items.medicineBatch',
          'items.medicineBatch.medicine',
        ],
      });
      expect(result).toEqual(mockReceipt);
    });

    it('should return null when receipt not found', async () => {
      (receiptRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.getReceiptByID(999);

      expect(result).toBeNull();
    });

    it('should throw when repo throws', async () => {
      (receiptRepo.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.getReceiptByID(1)).rejects.toThrow('DB error');
    });
  });

  afterEach(() => {
    // suppress unused variable warning
    void userRepo;
  });
});
