import { Injectable, Inject } from '@nestjs/common';
import { UserDto } from 'src/dtos/user-dto';
import { User } from '../../entities/user';
import { UserFactory } from '../../factories/user-factory';
import { AvailabilityBlockService } from '../availability-block/availability-block.service';
import { LogService } from 'src/log/services/log/log.service';

@Injectable()
export class UserObjectConverterService {

    constructor(
        @Inject(UserFactory) private readonly userFactory: UserFactory,
        @Inject(AvailabilityBlockService) private readonly availabilityBlockService: AvailabilityBlockService,
        @Inject(LogService) private readonly log: LogService
    ) { }

    public toEntity(dto: UserDto): User {
        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Executing");
        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Getting availabilities");
        const availabilities = this.availabilityBlockService.createManyFromDates(dto.availabilities);
        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Successfully got avaialabilities.");

        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Creating user object");
        const user = this.userFactory.fromRaw(dto.id, dto.name, dto.isAdult, dto.email, dto.phone, availabilities, dto.topics, dto.lastMatch, dto.created_at);
        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Successfully created user.");
        this.log.debug(UserObjectConverterService.name, this.toEntity.name, "Exiting");
        return user;
    }

    public toDto(user: User): UserDto {
        this.log.debug(UserObjectConverterService.name, this.toDto.name, "Executing");

        let dto: UserDto = null;

        if (user) {
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Creating DTO");
            dto = new UserDto();

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting ID");
            dto.id = user.id.value;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted ID");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting email");
            dto.email = user.email.value;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfuly extracted email.");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting name");
            dto.name = user.name.value;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted name");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting phone");
            dto.phone = user.phone.value;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracting phone.");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting availabilities");
            dto.availabilities = (!user.availabilities) ? [] : user.availabilities.map((availability) => {
                return availability.schedule;
            });
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted avaialabilities");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting Topics");
            dto.topics = ((user.topics) && (user.topics.length > 0)) ? user.topics.map((Topic) => {
                return Topic.title;
            }) : [];
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted topics");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting Last Match");
            dto.lastMatch = (user.lastScheduledMatch) ? user.lastScheduledMatch.value : null;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted last match");

            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Extracting creation date");
            dto.created_at = (user.creation) ? user.creation.value : null;
            this.log.debug(UserObjectConverterService.name, this.toDto.name, "Successfully extracted creation date.");
        }

        this.log.debug(UserObjectConverterService.name, this.toDto.name, "exiting");
        return dto;
    }
}
