import { Test, TestingModule } from '@nestjs/testing';
import { StockLogsController } from './stock-logs.controller';
import { StockLogsService } from './stock-logs.service';
import { StockLogDto } from './dto/stock-log.dto';
import { StockLog } from './entities/stock-log.entity';

const mockStockLogDto: StockLogDto = {
  id: 1,
  action: 'IN',
  quantityChange: 50,
  note: 'Initial stock',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  medicineBatch: {
    name: 'Paracetamol',
    batchNumber: 'BATCH-001',
    imageUrl: 'https://cdn.example.com/para.png',
  },
  createdBy: 'nurse01',
};

const mockRawLog: StockLog = {
  id: 1,
  action: 'IN',
  quantityChange: 50,
  note: 'Initial stock',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  medicineBatch: null as unknown as StockLog['medicineBatch'],
  createdBy: null as unknown as StockLog['createdBy'],
};

const mockService: jest.Mocked<
  Pick<StockLogsService, 'findAllLogs' | 'findLogsByBatch'>
> = {
  findAllLogs: jest.fn(),
  findLogsByBatch: jest.fn(),
};

describe('StockLogsController', () => {
  let controller: StockLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockLogsController],
      providers: [{ provide: StockLogsService, useValue: mockService }],
    }).compile();

    controller = module.get<StockLogsController>(StockLogsController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return array of StockLogDto from service', async () => {
      mockService.findAllLogs.mockResolvedValue([
        mockStockLogDto,
      ] as StockLogDto[]);

      const result = await controller.findAll();

      expect(mockService.findAllLogs).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockStockLogDto] as StockLogDto[]);
    });

    it('should return empty array when no logs exist', async () => {
      mockService.findAllLogs.mockResolvedValue([] as StockLogDto[]);

      const result = await controller.findAll();

      expect(result).toEqual([] as StockLogDto[]);
    });

    it('should propagate service errors', async () => {
      mockService.findAllLogs.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll()).rejects.toThrow('Service error');
    });
  });

  describe('findByOne', () => {
    it('should call findLogsByBatch with parsed numeric id', async () => {
      mockService.findLogsByBatch.mockResolvedValue([mockRawLog] as StockLog[]);

      const result = await controller.findByOne('100');

      expect(mockService.findLogsByBatch).toHaveBeenCalledWith(100);
      expect(result).toEqual([mockRawLog] as StockLog[]);
    });

    it('should return empty array when batch has no logs', async () => {
      mockService.findLogsByBatch.mockResolvedValue([] as StockLog[]);

      const result = await controller.findByOne('999');

      expect(result).toEqual([] as StockLog[]);
    });

    it('should propagate service errors', async () => {
      mockService.findLogsByBatch.mockRejectedValue(new Error('Not found'));

      await expect(controller.findByOne('1')).rejects.toThrow('Not found');
    });
  });
});
