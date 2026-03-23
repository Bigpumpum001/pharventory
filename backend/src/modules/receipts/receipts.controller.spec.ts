import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { User } from '../users/entities/user.entity';

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

const mappedReceipt = {
  id: 1,
  userName: 'nurse01',
  patientName: 'John Doe',
  totalItems: 1,
  note: 'test note',
  createdAt: mockReceipt.createdAt,
  items: [
    {
      id: 1,
      medicineBatch: {
        id: 10,
        medicineId: 1,
        medicineName: 'Paracetamol',
        batchNumber: 'B001',
        quantity: 100,
        expiryDate: mockBatch.expiryDate,
        createdAt: mockBatch.createdAt,
        updatedAt: mockBatch.updatedAt,
      },
      quantity: 2,
      price: 50,
      createdAt: mockItem.createdAt,
    },
  ],
};

const mockReceiptsService = {
  findAllReceipt: jest.fn(),
  getReceiptByID: jest.fn(),
};

describe('ReceiptsController', () => {
  let controller: ReceiptsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [{ provide: ReceiptsService, useValue: mockReceiptsService }],
    }).compile();

    controller = module.get<ReceiptsController>(ReceiptsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of mapped receipts', async () => {
      mockReceiptsService.findAllReceipt.mockResolvedValue([mappedReceipt]);

      const result = await controller.findAll();

      expect(mockReceiptsService.findAllReceipt).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mappedReceipt]);
    });

    it('should return empty array when no receipts', async () => {
      mockReceiptsService.findAllReceipt.mockResolvedValue(
        [] as (typeof mappedReceipt)[],
      );

      const result = await controller.findAll();

      expect(result).toEqual([] as typeof result);
    });

    it('should throw when service throws', async () => {
      mockReceiptsService.findAllReceipt.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findAll()).rejects.toThrow('Service error');
    });
  });

  describe('findOne', () => {
    it('should return receipt by id', async () => {
      mockReceiptsService.getReceiptByID.mockResolvedValue(mockReceipt);

      const result = await controller.findOne('1');

      expect(mockReceiptsService.getReceiptByID).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockReceipt);
    });

    it('should return null when receipt not found', async () => {
      mockReceiptsService.getReceiptByID.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(mockReceiptsService.getReceiptByID).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should throw when service throws', async () => {
      mockReceiptsService.getReceiptByID.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findOne('1')).rejects.toThrow('Service error');
    });
  });
});
