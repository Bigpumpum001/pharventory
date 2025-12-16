import { Controller, Get, Body, Param } from '@nestjs/common';
import { StockLogsService } from './stock-logs.service';

@Controller('/api/stock-logs')
export class StockLogsController {
  constructor(private readonly stockLogsService: StockLogsService) {}

  @Get()
  findAll() {
    return this.stockLogsService.findAllLogs();
  }

  @Get(':id')
  findByOne(@Param('id') id: string) {
    return this.stockLogsService.findLogsByBatch(+id);
  }
}
