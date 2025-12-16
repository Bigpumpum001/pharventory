import { Module } from '@nestjs/common';
import { StockLogsService } from './stock-logs.service';
import { StockLogsController } from './stock-logs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLog } from './entities/stock-log.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockLog, User])],
  controllers: [StockLogsController],
  providers: [StockLogsService],
  exports: [StockLogsService],
})
export class StockLogsModule {}
