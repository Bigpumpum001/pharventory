import { Test, TestingModule } from '@nestjs/testing';
import { MedicineBatchesController } from './medicine-batches.controller';
import { MedicineBatchesService } from './medicine-batches.service';

describe('MedicineBatchesController', () => {
  let controller: MedicineBatchesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicineBatchesController],
      providers: [MedicineBatchesService],
    }).compile();

    controller = module.get<MedicineBatchesController>(MedicineBatchesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
