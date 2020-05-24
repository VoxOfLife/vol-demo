import { Test, TestingModule } from '@nestjs/testing';
import { MatchObjectConverterService } from './match-object-converter.service';

describe('MatchObjectConverterService', () => {
  let service: MatchObjectConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchObjectConverterService],
    }).compile();

    service = module.get<MatchObjectConverterService>(MatchObjectConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
