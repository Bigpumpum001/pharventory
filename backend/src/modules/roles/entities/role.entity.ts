import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'role_name', length: 10 })
  roleName: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
