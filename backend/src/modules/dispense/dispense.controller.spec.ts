import { Test, TestingModule } from '@nestjs/testing';
import { DispenseController } from './dispense.controller';
import { DispenseService } from './dispense.service';

describe('DispenseController', () => {
  let controller: DispenseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispenseController],
      providers: [DispenseService],
    }).compile();

    controller = module.get<DispenseController>(DispenseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
