import { Medicine } from 'src/modules/medicines/entities/medicine.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @OneToMany(() => Medicine, (medicine) => medicine.unit)
  medicines: Medicine[];
}
