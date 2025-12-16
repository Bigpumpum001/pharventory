import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThanOrEqual } from 'typeorm';
import { StockLog } from '../stock-logs/entities/stock-log.entity';
import { MedicineBatch } from '../medicine-batches/entities/medicine-batch.entity';
import { Receipt } from '../receipts/entities/receipt.entity';
import { ReceiptItem } from '../receipts/entities/receipt-item.entity';
import { User } from '../users/entities/user.entity';

type DispenseItem = { medicineId: number; quantity: number };
@Injectable()
export class DispenseService {
  constructor(
    @InjectRepository(MedicineBatch)
    private batchRepo: Repository<MedicineBatch>,
    @InjectRepository(StockLog)
    private logRepo: Repository<StockLog>,
    @InjectRepository(Receipt)
    private receiptRepo: Repository<Receipt>,
    @InjectRepository(ReceiptItem)
    private receiptItemRepo: Repository<ReceiptItem>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private dataSource: DataSource,
  ) {}
  async dispense(
    items: DispenseItem[],
    patientName = 'Walk-in Customer',
    userId?: number,
  ) {
    // ใช้ transaction เพื่อให้ atomic
    return await this.dataSource.transaction(async (manager) => {
      // สร้างใบเสร็จ
      const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
      let user: User | undefined;
      if (userId) {
        user =
          (await manager.findOne(User, { where: { id: userId } })) || undefined;
      }
      // console.log('user', user);
      const receipt = manager.create(Receipt, {
        user,
        patientName,
        totalItems,
      });
      await manager.save(receipt);

      for (const it of items) {
        let remaining = it.quantity;

        // หา batch ของยาที่ยังไม่หมดอายุ เรียงตามวันหมดอายุ (FEFO สำหรับยาที่ยังไม่หมดอายุ)
        const now = new Date();
        const batches = await manager.find(MedicineBatch, {
          where: {
            medicine: { id: it.medicineId },
            expiryDate: MoreThanOrEqual(now), // แค่ที่ยังไม่หมดอายุ
          },
          relations: ['medicine'],
          order: { expiryDate: 'ASC' }, // FEFO - ยาที่จะหมดอายุเร็วสุดจะถูกจ่ายก่อน
        });

        for (const batch of batches) {
          if (remaining <= 0) break;

          const deduct = Math.min(batch.quantity, remaining);
          if (deduct <= 0) continue;

          // ลด stock
          batch.quantity -= deduct;
          await manager.save(batch);

          // สร้าง stock log
          const log = manager.create(StockLog, {
            medicineBatch: batch,
            action: 'OUT',
            quantityChange: deduct,
            note: 'Dispense',
            createdBy: user,
          });
          await manager.save(log);

          // สร้าง receipt item สำหรับ batch นี้
          const receiptItem = manager.create(ReceiptItem, {
            medicineBatch: batch,
            quantity: deduct,
            price: batch.medicine.price ?? 0,
            receipt,
          });
          await manager.save(receiptItem);

          remaining -= deduct;
        }

        if (remaining > 0) {
          throw new HttpException(
            `Not enough stock for medicine id ${it.medicineId}`,
            400,
          );
        }
      }

      // return receipt พร้อม relation
      return manager.findOne(Receipt, {
        where: { id: receipt.id },
        relations: [
          'user',
          'items',
          'items.medicineBatch',
          'items.medicineBatch.medicine',
        ],
      });
    });
  }
}
