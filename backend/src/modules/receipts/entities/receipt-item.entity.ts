import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Receipt } from './receipt.entity';
import { MedicineBatch } from 'src/modules/medicine-batches/entities/medicine-batch.entity';

@Entity('receipt_items')
export class ReceiptItem {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => Receipt, (receipt) => receipt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt: Receipt;

  @ManyToOne(() => MedicineBatch, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'medicine_batch_id' })
  medicineBatch: MedicineBatch;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
