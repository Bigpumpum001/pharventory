import { Injectable } from '@nestjs/common';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { UpdateMedicineBatchDto } from './dto/update-medicine-batch.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicineBatch } from './entities/medicine-batch.entity';
import { Repository } from 'typeorm';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MedicineBatchesService {
  constructor(
    @InjectRepository(MedicineBatch)
    private batchRepo: Repository<MedicineBatch>,
    @InjectRepository(Medicine)
    private medRepo: Repository<Medicine>,
    @InjectRepository(StockLog)
    private logRepo: Repository<StockLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAllBatch() {
    const batch = await this.batchRepo.find({
      relations: ['medicine'],
    });
    return batch.map((b) => ({
      id: b.id,
      medicineName: b.medicine.name,
      batchNumber: b.batchNumber,
      quantity: b.quantity,
      expiryDate: b.expiryDate,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      medicineId: b.medicine.id,
    }));
  }

  async createBatch(data: CreateMedicineBatchDto, userId?: number) {
    const medicine = await this.medRepo.findOne({
      where: { id: data.medicineId },
    });
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    const batch = this.batchRepo.create({
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      expiryDate: data.expiryDate,
      medicine: medicine,
    });
    await this.batchRepo.save(batch);

    let user: User | undefined = undefined;
    if (userId) {
      user =
        (await this.userRepo.findOne({ where: { id: userId } })) || undefined;
    }

    await this.logRepo.save({
      medicineBatch: batch,
      quantityChange: data.quantity,
      action: 'IN',
      note: 'New batch',
      createdBy: user,
    });
    return batch;
  }

  async updateBatch(
    batchId: number,
    data: UpdateMedicineBatchDto,
    userId?: number,
  ) {
    // console.log('batchId', batchId, 'data', data);
    const batch = await this.batchRepo.findOne({
      where: { id: batchId },
      relations: ['medicine'],
    });
    if (!batch) {
      throw new Error('Batch not found');
    }

    // Store original values for logging
    const originalQuantity = batch.quantity;

    // Update batch with new data
    Object.assign(batch, data);
    await this.batchRepo.save(batch);

    // Log quantity changes if quantity was updated
    if (data.quantity !== undefined && data.quantity !== originalQuantity) {
      const quantityChange = data.quantity - originalQuantity;
      let note = '';
      let action = 'ADJUST';
      if (quantityChange > 0) {
        note = `Increase: ${originalQuantity} → ${data.quantity}`;
        action = 'IN,ADJUST';
      } else if (quantityChange < 0) {
        note = `Decrease: ${originalQuantity} → ${data.quantity}`;
        action = 'OUT,ADJUST';
      }

      let user: User | undefined = undefined;
      if (userId) {
        user =
          (await this.userRepo.findOne({ where: { id: userId } })) || undefined;
      }

      await this.logRepo.save({
        medicineBatch: batch,
        quantityChange: Math.abs(quantityChange),
        action: action,
        note: note,
        createdBy: user,
      });
    }

    return {
      id: batch.id,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      expiryDate: batch.expiryDate,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
      medicineId: batch.medicine.id,
    };
  }

  async removeBatch(batchId: number) {
    const batch = await this.batchRepo.findOne({ where: { id: batchId } });
    if (!batch) throw new Error('Batch not found');
    if (batch.quantity > 0) throw new Error('Cannot delete batch with stock');
    await this.batchRepo.delete(batchId);
  }
}
