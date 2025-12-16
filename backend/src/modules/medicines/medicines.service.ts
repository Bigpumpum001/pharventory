import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import {
  UpdateMedicineDto,
  updateMedicinePayload,
} from './dto/update-medicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Repository } from 'typeorm';
import { Unit } from '../units/entities/unit.entity';
import { Category } from '../category/entities/category.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private medicineRepo: Repository<Medicine>,
    @InjectRepository(MedicineBatch)
    private medicineBatchRepo: Repository<MedicineBatch>,
    @InjectRepository(Category)
    private cateRepo: Repository<Category>,
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
    @InjectRepository(StockLog)
    private logRepo: Repository<StockLog>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
  async findAllWithSummary(expired = false) {
    const medicines = await this.medicineRepo.find({
      relations: ['batches', 'category', 'unit'],
    });

    const processedMedicines = medicines.map((med) => {
      // filter batches ตาม expired flag
      const now = new Date();
      const filteredBatches = expired
        ? med.batches.filter((b) => new Date(b.expiryDate) < now) // หมดอายุ
        : med.batches.filter((b) => new Date(b.expiryDate) >= now); // ยังไม่หมด

      const totalStock =
        filteredBatches.reduce((a, b) => a + b.quantity, 0) || 0;

      const nearestExpired =
        filteredBatches.length > 0
          ? filteredBatches.reduce((min, b) =>
              new Date(b.expiryDate) < new Date(min.expiryDate) ? b : min,
            ).expiryDate
          : null;

      return {
        ...med,
        totalStock,
        nearestExpired,
        batches: filteredBatches,
      };
    });

    // For expired view, only show medicines with expired stock > 0
    // For non-expired view, show all medicines (including those with 0 stock)
    if (expired) {
      return processedMedicines.filter((med) => med.totalStock > 0);
    } else {
      return processedMedicines;
    }
  }

  getMedicineByID(id: number) {
    return this.medicineRepo.findOne({
      where: { id },
      relations: ['batches', 'category', 'unit'],
    });
  }
  async createMedicine(createMedicineDto: CreateMedicineDto, userId?: number) {
    // console.log(createMedicineDto);
    const { batches = [], unitId, categoryId, ...medData } = createMedicineDto;
    // console.log(createMedicineDto.batches);
    const unit = await this.unitRepo.findOne({ where: { id: unitId } });
    if (!unit) throw new NotFoundException('Unit not found');

    const category = await this.cateRepo.findOne({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');

    // Build and save medicine entity
    let user: User | undefined = undefined;
    if (userId) {
      user =
        (await this.userRepo.findOne({ where: { id: userId } })) || undefined;
    }
    const medicineEntity = this.medicineRepo.create({
      ...medData,
      unit,
      category,
      createdBy: user,
      updatedBy: user,
    });
    const medicine = await this.medicineRepo.save(medicineEntity);
    //สร้างใน if ข้างล่างนี้
    if (batches?.length > 0) {
      let user: User | undefined = undefined;
      if (userId) {
        user =
          (await this.userRepo.findOne({ where: { id: userId } })) || undefined;
      }
      for (const batchData of batches) {
        const batch = this.medicineBatchRepo.create({
          batchNumber: batchData.batchNumber,
          quantity: batchData.quantity,
          expiryDate: batchData.expiryDate,
          medicine,
        });
        await this.medicineBatchRepo.save(batch);

        await this.logRepo.save({
          medicineBatch: batch,
          quantityChange: batchData.quantity,
          action: 'IN',
          note: 'New batch',
          createdBy: user,
        });
      }
    }

    return this.getMedicineByID(medicine.id);
  }
  async updateMedicine(id: number, updateMedicineDto: UpdateMedicineDto) {
    // If unitId is provided, resolve to unit relation
    const { categoryId, unitId, ...medicineData } = updateMedicineDto;
    const updatePayload: updateMedicinePayload = { ...medicineData };
    if (unitId) {
      const unit = await this.unitRepo.findOne({
        where: { id: unitId },
      });
      if (!unit) throw new NotFoundException('Unit not found');
      updatePayload.unit = unit;
    }
    if (categoryId) {
      const category = await this.cateRepo.findOne({
        where: { id: categoryId },
      });
      if (!category) throw new NotFoundException('Category not found');
      updatePayload.category = category;
    }
    const medicine = await this.medicineRepo.preload({
      id,
      ...updatePayload,
    });
    if (!medicine) throw new NotFoundException('Medicine not found');
    return this.medicineRepo.save(medicine);
  }

  async removeMedicine(id: number) {
    const med = await this.getMedicineByID(id);
    if (!med) throw new Error('Medicine not found');
    const totalStock =
      med.batches?.reduce((sum, b) => sum + b.quantity, 0) || 0;
    if (totalStock > 0) throw new Error('Cannot delete medicine with stock');
    await this.medicineRepo.delete(id);
  }
}
