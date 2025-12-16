import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Medicine } from 'src/modules/medicines/entities/medicine.entity';
@Entity('medicine_batches')
@Unique(['medicine', 'batchNumber'])
export class MedicineBatch {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => Medicine, (medicine) => medicine.batches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column({ name: 'batch_number', length: 50 })
  batchNumber: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
