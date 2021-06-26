import { Test, TestingModule } from '@nestjs/testing';
import { CoffesService } from './coffes.service';

describe('CoffesService', () => {
  let service: CoffesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoffesService],
    }).compile();

    service = module.get<CoffesService>(CoffesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
