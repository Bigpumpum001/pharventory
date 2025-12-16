import { Controller, Get, Body, Param } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';

@Controller('/api/receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  findAll() {
    return this.receiptsService.findAllReceipt();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.getReceiptByID(+id);
  }
}
