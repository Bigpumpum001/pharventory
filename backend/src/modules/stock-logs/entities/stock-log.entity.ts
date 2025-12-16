import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { MedicineBatch } from 'src/modules/medicine-batches/entities/medicine-batch.entity';
@Entity('stock_logs')
export class StockLog {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => MedicineBatch, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'medicine_batch_id' })
  medicineBatch: MedicineBatch;

  @Column({ length: 20 })
  action: string; // e.g., 'IN', 'OUT', 'ADJUST'

  @Column({ name: 'quantity_change' })
  quantityChange: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'NOW()',
  })
  createdAt: Date;
}
