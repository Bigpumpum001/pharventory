import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicineBatch } from '../../medicine-batches/entities/medicine-batch.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('medicines')
export class Medicine {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ name: 'generic_name', nullable: true, length: 100 })
  genericName: string;

  @ManyToOne(() => Category, (category) => category.medicines, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Unit, (unit) => unit.medicines, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true, length: 100 })
  supplier: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl?: string;

  @ManyToOne(() => User, (user) => user.createdMedicines, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.updatedMedicines, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => MedicineBatch, (batch) => batch.medicine)
  batches: MedicineBatch[];
}
