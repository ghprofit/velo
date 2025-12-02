import { Test, TestingModule } from '@nestjs/testing';
import { VeriffController } from './veriff.controller';
import { VeriffService } from './veriff.service';

describe('VeriffController', () => {
  let controller: VeriffController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeriffController],
      providers: [VeriffService],
    }).compile();

    controller = module.get<VeriffController>(VeriffController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
