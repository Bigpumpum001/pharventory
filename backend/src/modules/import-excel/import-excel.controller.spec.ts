import { Test, TestingModule } from '@nestjs/testing';
import { ImportExcelController } from './import-excel.controller';
import { ImportExcelService } from './import-excel.service';

describe('ImportExcelController', () => {
  let controller: ImportExcelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportExcelController],
      providers: [ImportExcelService],
    }).compile();

    controller = module.get<ImportExcelController>(ImportExcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
