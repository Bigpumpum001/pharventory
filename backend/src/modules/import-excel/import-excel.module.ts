import { Module } from '@nestjs/common';
import { ImportExcelService } from './import-excel.service';
import { ImportExcelController } from './import-excel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Medicine, MedicineBatch]), RedisModule],
  controllers: [ImportExcelController],
  providers: [ImportExcelService],
})
export class ImportExcelModule {}
