import { Injectable, Inject } from '@nestjs/common';
import { Match } from '../../entities/match';
import { MatchDto } from 'src/dtos/match-dto';
import { ConfigService } from '@nestjs/config';
import { MatchFactory } from '../../factories/match-factory';
import { UserObjectConverterService } from '../user-object-converter/user-object-converter.service';
import { MatchParticipantsDto } from 'src/dtos/match-participants-dto';
import { ConfirmedUsersObjectConverterService } from '../confirmed-users-object-converter/confirmed-users-object-converter.service';
import { LogService } from 'src/log/services/log/log.service';
import { ConfirmedUsersDto } from 'src/dtos/confirmed-users-dto';

@Injectable()
export class MatchObjectConverterService {

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(MatchFactory) private readonly matchFactory: MatchFactory,
        @Inject(UserObjectConverterService) private readonly userConverter: UserObjectConverterService,
        @Inject(ConfirmedUsersObjectConverterService) private readonly confirmedUsersConverter: ConfirmedUsersObjectConverterService,
        @Inject(LogService) private readonly log: LogService,
    ) {}

    public toEntity(match: MatchDto): Match {
        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Executing");

        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Converting first user");
        const user1 = this.userConverter.toEntity(match.participants.a);
        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Successfully converted first user.");

        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Converting second user");
        const user2 = this.userConverter.toEntity(match.participants.b);
        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Successfully converted second user.");

        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Converting confirmed users");
        const confirmedParticipants = this.confirmedUsersConverter.toObject(match.confirmedParticipants)
        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Successfully converted confirmed users");

        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Creating match entity");
        const entity = this.matchFactory.fromRaw(match.id, user1, user2, match.schedule, match.status, match.link, match.number, confirmedParticipants.a, confirmedParticipants.b);
        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Successfully created Match entity.");

        this.log.debug(MatchObjectConverterService.name, this.toEntity.name, "Exiting");
        return entity;
    }

    public toDto(match: Match): MatchDto {
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Executing");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Creating DTO");
        const dto = new MatchDto();
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully created DTO");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting match id");
        dto.id = match.id.value;
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted match id.");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting match link");
        dto.link = match.link.value;
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted match link.");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Creating match participants DTO");
        const participantsDto = new MatchParticipantsDto();

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting match participants.");
        participantsDto.a = this.userConverter.toDto(match.participants.a);
        participantsDto.b = this.userConverter.toDto(match.participants.b);
        dto.participants = participantsDto;
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted match participants.");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting match schedule");
        dto.schedule = match.schedule.value;
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted match schedule");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting match status.");
        dto.status = match.status.value;
        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted match status.");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Extracting confirmed users.");

        let confirmedUsrs: ConfirmedUsersDto = null;

        if (match.confirmedParticipants) {
            confirmedUsrs = this.confirmedUsersConverter.toDto(match.confirmedParticipants);
        }

        dto.confirmedParticipants = confirmedUsrs;


        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Successfully extracted confirmed participants.");

        this.log.debug(MatchObjectConverterService.name, this.toDto.name, "Exiting.");
        return dto;
    }
}
