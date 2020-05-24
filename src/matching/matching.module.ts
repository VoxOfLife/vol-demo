import { Module, forwardRef } from '@nestjs/common';
import { MatchingService } from './services/matching/matching.service';
import { LogModule } from 'src/log/log.module';
import { ConfigModule } from '@nestjs/config';
import { UsersRepository } from './repositories/users-repository';
import { UserFactory } from './factories/user-factory';
import { AvailabilityBlockFactory } from './factories/availability-block-factory';
import { MatchesRepository } from './repositories/matches-repository';
import { MatchController } from './controllers/match/match.controller';
import { MatchFactory } from './factories/match-factory';
import { UserObjectConverterService } from './services/user-object-converter/user-object-converter.service';
import { AvailabilityBlockService } from './services/availability-block/availability-block.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MatchObjectConverterService } from './services/match-object-converter/match-object-converter.service';
import { ConfirmedUsersObjectConverterService } from './services/confirmed-users-object-converter/confirmed-users-object-converter.service';


@Module({
  providers: [
      MatchingService,
      UsersRepository,
      UserFactory,
      MatchFactory,
      AvailabilityBlockFactory,
      MatchesRepository,
      UserObjectConverterService,
      AvailabilityBlockService,
      MatchObjectConverterService,
      ConfirmedUsersObjectConverterService,
      
    ],
  imports: [
      LogModule,
      ConfigModule,
      NotificationsModule,
    ],
  controllers: [MatchController],
})
export class MatchingModule {

}
