import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { ReceiptItem } from './receipt-item.entity';
@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'patient_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  patientName: string;

  @Column({ name: 'total_items' })
  totalItems: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => ReceiptItem, (item) => item.receipt, { cascade: true })
  items: ReceiptItem[];
}
