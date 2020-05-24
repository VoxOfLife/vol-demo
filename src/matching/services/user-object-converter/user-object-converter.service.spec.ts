import { Test, TestingModule } from '@nestjs/testing';
import { UserObjectConverterService } from './user-object-converter.service';

describe('UserObjectConverterService', () => {
  let service: UserObjectConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserObjectConverterService],
    }).compile();

    service = module.get<UserObjectConverterService>(UserObjectConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
