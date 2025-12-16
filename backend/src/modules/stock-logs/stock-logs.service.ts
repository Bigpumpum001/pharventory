import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockLog } from './entities/stock-log.entity';
import { Repository } from 'typeorm';
import { StockLogDto } from './dto/stock-log.dto';

@Injectable()
export class StockLogsService {
  constructor(
    @InjectRepository(StockLog)
    private logRepo: Repository<StockLog>,
  ) {}
  async findAllLogs(): Promise<StockLogDto[]> {
    const logs = await this.logRepo.find({
      relations: ['medicineBatch', 'createdBy', 'medicineBatch.medicine'],
      order: {
        id: 'DESC',
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      quantityChange: log.quantityChange,
      note: log.note,
      createdAt: log.createdAt,
      medicineBatch: {
        name: log.medicineBatch.medicine.name,
        batchNumber: log.medicineBatch.batchNumber,
        imageUrl: log.medicineBatch.medicine.imageUrl,
      },
      createdBy: log.createdBy?.username ?? null,
    }));
  }
  async findLogsByBatch(batchId: number) {
    return await this.logRepo.find({
      where: { medicineBatch: { id: batchId } },
      relations: ['medicineBatch', 'createdBy'],
    });
  }
}
