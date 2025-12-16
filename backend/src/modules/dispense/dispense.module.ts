import { Module } from '@nestjs/common';
import { DispenseService } from './dispense.service';
import { DispenseController } from './dispense.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispense } from './entities/dispense.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { ReceiptItem } from '../receipts/entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Dispense,
      MedicineBatch,
      StockLog,
      Receipt,
      ReceiptItem,
      User,
    ]),
  ],
  controllers: [DispenseController],
  providers: [DispenseService],
  exports: [DispenseService],
})
export class DispenseModule {}
