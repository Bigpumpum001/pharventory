import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { DispenseController } from './dispense.controller';
import { DispenseService } from './dispense.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';

import { Receipt } from '../receipts/entities/receipt.entity';
import { ReceiptItem } from '../receipts/entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { Medicine } from '../medicines/entities/medicine.entity';

import { DispenseDto } from './dto/dispense.dto';
import { CompleteDispenseDto } from './dto/complete-dispense.dto';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

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

// ─── AuthenticatedRequest mock ────────────────────────────────────────────────

// cast เป็น Parameters ของ controller โดยตรง แทนการ mock Request object เต็ม
type AuthReq = Parameters<InstanceType<typeof DispenseController>['create']>[1];

const mockAuthReq = (payload: JwtPayload): AuthReq =>
  ({ user: payload }) as AuthReq;

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DispenseController', () => {
  let controller: DispenseController;
  let dispenseService: { dispense: jest.Mock };

  const jwtPayload: JwtPayload = {
    sub: 1,
    username: 'admin',
    role: mockRole(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispenseController],
      providers: [
        { provide: DispenseService, useValue: { dispense: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DispenseController>(DispenseController);
    dispenseService = module.get<{ dispense: jest.Mock }>(DispenseService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create (single-item legacy) ────────────────────────────────────────────

  describe('create', () => {
    const dto: DispenseDto = {
      medicineId: 1,
      patientName: 'John Doe',
      quantity: 3,
    };

    it('should call dispense with single item array and return receipt', async () => {
      const receipt = mockReceipt();
      dispenseService.dispense.mockResolvedValue(receipt);

      const result = await controller.create(dto, mockAuthReq(jwtPayload));

      expect(dispenseService.dispense).toHaveBeenCalledWith(
        [{ medicineId: 1, quantity: 3 }],
        'John Doe',
        1,
      );
      expect(result).toEqual(receipt);
    });

    it('should propagate HttpException from service', async () => {
      dispenseService.dispense.mockRejectedValue(
        new HttpException('Not enough stock for medicine id 1', 400),
      );

      await expect(
        controller.create(dto, mockAuthReq(jwtPayload)),
      ).rejects.toThrow(HttpException);
    });
  });

  // ─── complete (multi-item) ───────────────────────────────────────────────────

  describe('complete', () => {
    const dto: CompleteDispenseDto = {
      patientName: 'Jane Doe',
      items: [
        { medicineId: 1, quantity: 2 },
        { medicineId: 2, quantity: 1 },
      ],
    };

    it('should call dispense with multiple items and return receipt', async () => {
      const receipt = mockReceipt({ totalItems: 3 });
      dispenseService.dispense.mockResolvedValue(receipt);

      const result = await controller.complete(dto, mockAuthReq(jwtPayload));

      expect(dispenseService.dispense).toHaveBeenCalledWith(
        [
          { medicineId: 1, quantity: 2 },
          { medicineId: 2, quantity: 1 },
        ],
        'Jane Doe',
        1,
      );
      expect(result).toEqual(receipt);
    });

    it('should propagate HttpException from service', async () => {
      dispenseService.dispense.mockRejectedValue(
        new HttpException('Not enough stock for medicine id 2', 400),
      );

      await expect(
        controller.complete(dto, mockAuthReq(jwtPayload)),
      ).rejects.toThrow(HttpException);
    });
  });
});
