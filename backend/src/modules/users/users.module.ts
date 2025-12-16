import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from './entities/user.entity';
import { StockLog } from '../stock-logs/entities/stock-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, StockLog])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
