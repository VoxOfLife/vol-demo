import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmedUsersObjectConverterService } from './confirmed-users-object-converter.service';

describe('ConfirmedUsersObjectConverterService', () => {
  let service: ConfirmedUsersObjectConverterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfirmedUsersObjectConverterService],
    }).compile();

    service = module.get<ConfirmedUsersObjectConverterService>(ConfirmedUsersObjectConverterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
