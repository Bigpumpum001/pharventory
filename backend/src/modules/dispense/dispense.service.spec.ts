import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  DataSource,
  MoreThanOrEqual,
  ObjectLiteral,
  Repository,
} from 'typeorm';

import { DispenseService } from './dispense.service';

import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { ReceiptItem } from '../receipts/entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Role } from '../roles/entities/role.entity';
import { Category } from '../category/entities/category.entity';
import { Unit } from '../units/entities/unit.entity';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockRole = (overrides: Partial<Role> = {}): Role => ({
  id: 1,
  roleName: 'admin',
  users: [] as User[],
  ...overrides,
});

const mockUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  username: 'admin',
  passwordHash: '$2b$10$hashed',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  role: mockRole(),
  stockLogs: [] as StockLog[],
  receipt: [] as Receipt[],
  createdMedicines: [] as Medicine[],
  updatedMedicines: [] as Medicine[],
  ...overrides,
});

const mockCategory = (overrides: Partial<Category> = {}): Category => ({
  id: 1,
  name: 'Analgesic',
  description: 'ยาแก้ปวด',
  isActive: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  medicines: [] as Medicine[],
  ...overrides,
});

const mockUnit = (overrides: Partial<Unit> = {}): Unit => ({
  id: 1,
  unitName: 'tablet',
  medicines: [] as Medicine[],
  ...overrides,
});

const mockMedicine = (overrides: Partial<Medicine> = {}): Medicine => ({
  id: 1,
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  category: mockCategory(),
  unit: mockUnit(),
  price: 10,
  supplier: 'PharmaCo',
  imageUrl: undefined,
  createdBy: mockUser(),
  updatedBy: mockUser(),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  isActive: true,
  batches: [] as MedicineBatch[],
  ...overrides,
});

const mockBatch = (overrides: Partial<MedicineBatch> = {}): MedicineBatch => ({
  id: 1,
  batchNumber: 'BATCH-001',
  quantity: 100,
  expiryDate: new Date('2099-12-31'),
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  medicine: mockMedicine(),
  ...overrides,
});

const mockReceipt = (overrides: Partial<Receipt> = {}): Receipt => ({
  id: 1,
  user: mockUser(),
  patientName: 'Walk-in Customer',
  totalItems: 1,
  note: '',
  createdAt: new Date('2025-01-01'),
  items: [] as ReceiptItem[],
  ...overrides,
});

// ─── Manager mock ─────────────────────────────────────────────────────────────

type ManagerMock = {
  findOne: jest.Mock;
  find: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

const buildManagerMock = (): ManagerMock => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DispenseService', () => {
  let service: DispenseService;
  let manager: ManagerMock;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    manager = buildManagerMock();
    dataSource = {
      transaction: jest
        .fn()
        .mockImplementation((cb: (m: ManagerMock) => Promise<unknown>) =>
          cb(manager),
        ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispenseService,
        {
          provide: getRepositoryToken(MedicineBatch),
          useValue: createMockRepo<MedicineBatch>(),
        },
        {
          provide: getRepositoryToken(StockLog),
          useValue: createMockRepo<StockLog>(),
        },
        {
          provide: getRepositoryToken(Receipt),
          useValue: createMockRepo<Receipt>(),
        },
        {
          provide: getRepositoryToken(ReceiptItem),
          useValue: createMockRepo<ReceiptItem>(),
        },
        { provide: getRepositoryToken(User), useValue: createMockRepo<User>() },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<DispenseService>(DispenseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('dispense', () => {
    it('should complete dispense and return receipt with relations', async () => {
      const user = mockUser({ id: 1 });
      const batch = mockBatch({ quantity: 50 });
      const receipt = mockReceipt({ id: 1 });
      const finalReceipt = mockReceipt({ id: 1, totalItems: 5 });

      manager.findOne
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(finalReceipt);
      manager.create
        .mockReturnValueOnce(receipt)
        .mockReturnValueOnce({} as StockLog)
        .mockReturnValueOnce({} as ReceiptItem);
      manager.find.mockResolvedValueOnce([batch] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      const result = await service.dispense(
        [{ medicineId: 1, quantity: 5 }],
        'John Doe',
        1,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(manager.create).toHaveBeenCalledWith(
        Receipt,
        expect.objectContaining({ patientName: 'John Doe', totalItems: 5 }),
      );
      // ตรวจ find MedicineBatch — หลีกเลี่ยง unsafe any ด้วยการ assert ทีละ field
      const findCall = manager.find.mock.calls[0] as [
        typeof MedicineBatch,
        {
          where: {
            medicine: { id: number };
            expiryDate: ReturnType<typeof MoreThanOrEqual>;
          };
          relations: string[];
          order: { expiryDate: string };
        },
      ];
      expect(findCall[0]).toBe(MedicineBatch);
      expect(findCall[1].where.medicine).toEqual({ id: 1 });
      expect(findCall[1].order).toEqual({ expiryDate: 'ASC' });
      expect(result).toEqual(finalReceipt);
    });

    it('should use default patientName "Walk-in Customer" when not provided', async () => {
      const batch = mockBatch({ quantity: 50 });
      const receipt = mockReceipt({ patientName: 'Walk-in Customer' });

      manager.findOne.mockResolvedValueOnce(receipt);
      manager.create
        .mockReturnValueOnce(receipt)
        .mockReturnValueOnce({} as StockLog)
        .mockReturnValueOnce({} as ReceiptItem);
      manager.find.mockResolvedValueOnce([batch] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      await service.dispense([{ medicineId: 1, quantity: 1 }]);

      expect(manager.create).toHaveBeenCalledWith(
        Receipt,
        expect.objectContaining({ patientName: 'Walk-in Customer' }),
      );
    });

    it('should NOT query User when userId is undefined', async () => {
      const batch = mockBatch({ quantity: 50 });
      const receipt = mockReceipt();

      manager.findOne.mockResolvedValueOnce(receipt);
      manager.create
        .mockReturnValueOnce(receipt)
        .mockReturnValueOnce({} as StockLog)
        .mockReturnValueOnce({} as ReceiptItem);
      manager.find.mockResolvedValueOnce([batch] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      await service.dispense(
        [{ medicineId: 1, quantity: 1 }],
        'Walk-in Customer',
        undefined,
      );

      // cast calls เพื่อหลีกเลี่ยง unsafe any
      const findOneCalls = manager.findOne.mock.calls as Array<
        [unknown, unknown]
      >;
      const userCalls = findOneCalls.filter((call) => call[0] === User);
      expect(userCalls).toHaveLength(0);
    });

    it('should deduct from multiple batches (FEFO) when first batch has insufficient stock', async () => {
      const batch1 = mockBatch({
        id: 1,
        quantity: 3,
        expiryDate: new Date('2026-01-01'),
      });
      const batch2 = mockBatch({
        id: 2,
        quantity: 10,
        expiryDate: new Date('2027-01-01'),
      });
      const receipt = mockReceipt({ totalItems: 5 });

      manager.findOne.mockResolvedValueOnce(receipt);
      manager.create
        .mockReturnValueOnce(receipt)
        .mockReturnValueOnce({} as StockLog)
        .mockReturnValueOnce({} as ReceiptItem)
        .mockReturnValueOnce({} as StockLog)
        .mockReturnValueOnce({} as ReceiptItem);
      manager.find.mockResolvedValueOnce([batch1, batch2] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      await service.dispense([{ medicineId: 1, quantity: 5 }], 'Jane');

      // receipt(1) + batch1(1) + log1(1) + item1(1) + batch2(1) + log2(1) + item2(1) = 7
      expect(manager.save).toHaveBeenCalledTimes(7);
    });

    it('should throw HttpException 400 when stock is insufficient', async () => {
      const batch = mockBatch({ quantity: 2 });
      const receipt = mockReceipt();

      manager.findOne.mockResolvedValueOnce(null);
      manager.create.mockReturnValueOnce(receipt);
      manager.find.mockResolvedValueOnce([batch] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      await expect(
        service.dispense([{ medicineId: 1, quantity: 10 }], 'Walk-in Customer'),
      ).rejects.toThrow(
        new HttpException('Not enough stock for medicine id 1', 400),
      );
    });

    it('should throw HttpException 400 when no batches available for medicine', async () => {
      const receipt = mockReceipt();

      manager.findOne.mockResolvedValueOnce(null);
      manager.create.mockReturnValueOnce(receipt);
      manager.find.mockResolvedValueOnce([] as MedicineBatch[]);
      manager.save.mockResolvedValue(undefined);

      await expect(
        service.dispense([{ medicineId: 99, quantity: 1 }], 'Walk-in Customer'),
      ).rejects.toThrow(HttpException);
    });
  });
});
