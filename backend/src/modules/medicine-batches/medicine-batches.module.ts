import { Module } from '@nestjs/common';
import { MedicineBatchesService } from './medicine-batches.service';
import { MedicineBatchesController } from './medicine-batches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineBatch } from './entities/medicine-batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicineBatch, Medicine, StockLog, User]),
  ],
  controllers: [MedicineBatchesController],
  providers: [MedicineBatchesService],
  exports: [MedicineBatchesService],
})
export class MedicineBatchesModule {}
