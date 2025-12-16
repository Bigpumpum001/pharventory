import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MedicineBatchesService } from './medicine-batches.service';
import { CreateMedicineBatchDto } from './dto/create-medicine-batch.dto';
import { UpdateMedicineBatchDto } from './dto/update-medicine-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth-guard';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('/api/medicine-batches')
export class MedicineBatchesController {
  constructor(
    private readonly medicineBatchesService: MedicineBatchesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createMedicineBatchDto: CreateMedicineBatchDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.medicineBatchesService.createBatch(
      createMedicineBatchDto,
      req.user.sub,
    );
  }

  @Get()
  findAll() {
    return this.medicineBatchesService.findAllBatch();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateMedicineBatchDto: UpdateMedicineBatchDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.medicineBatchesService.updateBatch(
      +id,
      updateMedicineBatchDto,
      req.user.sub,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.medicineBatchesService.removeBatch(+id);
  }
}
