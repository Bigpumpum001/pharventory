import { Module } from '@nestjs/common';
import { MedicinesService } from './medicines.service';
import { MedicinesController } from './medicines.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Medicine } from './entities/medicine.entity';
import { Category } from '../category/entities/category.entity';
import { Unit } from '../units/entities/unit.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicineBatch,
      Medicine,
      Category,
      Unit,
      StockLog,
      User,
    ]),
  ],
  controllers: [MedicinesController],
  providers: [MedicinesService],
  exports: [MedicinesService],
})
export class MedicinesModule {}
