import { Test, TestingModule } from '@nestjs/testing';
import { TwofactorController } from './twofactor.controller';
import { TwofactorService } from './twofactor.service';

describe('TwofactorController', () => {
  let controller: TwofactorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwofactorController],
      providers: [TwofactorService],
    }).compile();

    controller = module.get<TwofactorController>(TwofactorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
