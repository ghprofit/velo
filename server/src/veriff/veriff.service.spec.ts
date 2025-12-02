import { Test, TestingModule } from '@nestjs/testing';
import { VeriffService } from './veriff.service';

describe('VeriffService', () => {
  let service: VeriffService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeriffService],
    }).compile();

    service = module.get<VeriffService>(VeriffService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
