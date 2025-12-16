import { Test, TestingModule } from '@nestjs/testing';
import { MedicineBatchesService } from './medicine-batches.service';

describe('MedicineBatchesService', () => {
  let service: MedicineBatchesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicineBatchesService],
    }).compile();

    service = module.get<MedicineBatchesService>(MedicineBatchesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
