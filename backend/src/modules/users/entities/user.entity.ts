import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Role } from 'src/modules/roles/entities/role.entity';
import { StockLog } from 'src/modules/stock-logs/entities/stock-log.entity';
import { Receipt } from 'src/modules/receipts/entities/receipt.entity';
import { Medicine } from 'src/modules/medicines/entities/medicine.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ length: 50 })
  username: string;

  @Column({ name: 'password_hash', length: 255, nullable: true })
  passwordHash: string;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  updatedAt: Date;

  @ManyToOne(() => Role, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'role' })
  role: Role;

  @OneToMany(() => StockLog, (log) => log.createdBy)
  stockLogs: StockLog[];
  @OneToMany(() => Receipt, (receipt) => receipt.user)
  receipt: Receipt[];
  @OneToMany(() => Medicine, (medicine) => medicine.createdBy)
  createdMedicines: Medicine[];
  @OneToMany(() => Medicine, (medicine) => medicine.updatedBy)
  updatedMedicines: Medicine[];
}
