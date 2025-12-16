import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { ReceiptItem } from './entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepo: Repository<Receipt>,
    @InjectRepository(ReceiptItem)
    private itemRepo: Repository<ReceiptItem>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAllReceipt() {
    const receipt = await this.receiptRepo.find({
      relations: [
        'user',
        'items',
        'items.medicineBatch',
        'items.medicineBatch.medicine',
      ],
      order: { id: 'DESC' },
    });
    return receipt.map((r) => ({
      id: r.id,
      userName: r.user.username,
      patientName: r.patientName,
      totalItems: r.totalItems,
      note: r.note,
      createdAt: r.createdAt,
      // items: r.items,
      items: r.items.map((i) => ({
        id: i.id,
        medicineBatch: {
          id: i.medicineBatch.id,
          medicineId: i.medicineBatch.medicine.id,
          medicineName: i.medicineBatch.medicine.name,
          batchNumber: i.medicineBatch.batchNumber,
          quantity: i.medicineBatch.quantity,
          expiryDate: i.medicineBatch.expiryDate,
          createdAt: i.medicineBatch.createdAt,
          updatedAt: i.medicineBatch.updatedAt,
        },
        quantity: i.quantity,
        price: i.price,
        createdAt: i.createdAt,
      })),
    }));
  }

  async getReceiptByID(id: number) {
    return await this.receiptRepo.findOne({
      where: { id },
      relations: [
        'items',
        'items.medicineBatch',
        'items.medicineBatch.medicine',
      ],
    });
  }
}
