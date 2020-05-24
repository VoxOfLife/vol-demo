import { User } from 'src/matching/entities/user';
import { UserId } from '../values/user-id';
import { Name } from '../values/name';
import { Email } from '../values/email';
import { AvailabilityBlock } from '../values/availability-block';
import { Topic } from '../values/topic';
import { CreationTime } from '../values/creation-time';
import { PhoneNumber } from '../values/phone-number';
import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'src/log/services/log/log.service';
import { MatchReference } from '../values/match-reference';


/**
 * UserFactory is a factory for User Entities.
 */

 @Injectable()
export class UserFactory {
    

    constructor(
        @Inject(LogService) private readonly log: LogService,
    ) {}

    public fromParts(id: UserId, name: Name, isAdult: boolean, email: Email, phone: PhoneNumber, availabilities: AvailabilityBlock[], topics: Topic[], lastMatch: MatchReference, created: CreationTime): User {
        return new User(id, name, isAdult, email, phone, availabilities, topics, lastMatch, created);
    }

    public fromRaw(id: string, name: string, isAdult: boolean, email: string, phone: string, availabilities: AvailabilityBlock[], topics: string[], lastMatch: string, created: Date): User {
        this.log.debug(UserFactory.name, this.fromRaw.name, "Executing");

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating User Id");
        const uid: UserId = new UserId(id);

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating User Name");
        const uname = new Name(name);

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating user email");
        const uemail = new Email(email);

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating user phone");
        const uphone = new PhoneNumber(phone);

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating user availabilities list");
        const uavailabilities = availabilities;

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating User topics");
        const utopics: Topic[] = [];
        if (topics) topics.forEach((topic) => utopics.push(new Topic(topic)));

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creating user creation date.");
        const ucreated = new CreationTime(created);

        this.log.debug(UserFactory.name, this.fromRaw.name, "Creatiung user last schedule");
        const ulastMatch: MatchReference = (lastMatch) ? new MatchReference(lastMatch) : null;

        this.log.debug(UserFactory.name, this.fromRaw.name, "Successfully created user");
        this.log.debug(UserFactory.name, this.fromRaw.name, "Exiting");
        return this.fromParts(uid, uname, isAdult, uemail, uphone, uavailabilities, utopics, ulastMatch, ucreated);
    }
}
