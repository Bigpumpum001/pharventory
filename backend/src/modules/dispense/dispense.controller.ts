import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { DispenseService } from './dispense.service';
import { DispenseDto } from './dto/dispense.dto';
import { CompleteDispenseDto } from './dto/complete-dispense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('/api/dispense')
export class DispenseController {
  constructor(private readonly dispenseService: DispenseService) {}

  // legacy single-item endpoint (kept for compatibility)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: DispenseDto, @Request() req: AuthenticatedRequest) {
    return this.dispenseService.dispense(
      [{ medicineId: dto.medicineId, quantity: dto.quantity }],
      dto.patientName,
      req.user.sub,
    );
  }

  // new endpoint to complete a dispense with multiple items
  @Post('complete')
  @UseGuards(JwtAuthGuard)
  complete(
    @Body() dto: CompleteDispenseDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.dispenseService.dispense(
      dto.items,
      dto.patientName,
      req.user.sub,
    );
  }
}
