import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityBlockService } from './availability-block.service';

describe('AvailabilityBlockService', () => {
  let service: AvailabilityBlockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AvailabilityBlockService],
    }).compile();

    service = module.get<AvailabilityBlockService>(AvailabilityBlockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
