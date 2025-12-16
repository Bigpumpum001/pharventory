import { Test, TestingModule } from '@nestjs/testing';
import { ImportExcelService } from './import-excel.service';

describe('ImportExcelService', () => {
  let service: ImportExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportExcelService],
    }).compile();

    service = module.get<ImportExcelService>(ImportExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
