import { Injectable, Inject } from "@nestjs/common";
import { User } from "../entities/user";
import { Match } from "../entities/match";
import { MatchId } from "../values/match-id";
import { UserPair } from "../values/user-pair";
import { MatchStatus } from "../values/match-status";
import { MatchLink } from "../values/match-link";
import { MatchSchedule } from "../values/match-schedule";
import { LogService } from "src/log/services/log/log.service";
import { MatchCallNumber } from "../values/match-call-number";
import { ConfirmedParticipants } from "../values/confirmed-participants";

@Injectable()
export class MatchFactory {

    constructor(
        @Inject(LogService) private readonly log: LogService
    ) {}

    public fromRaw(id: string, user1: User, user2: User, schedule: Date, status: string, link: string, number: string, confirmedUser1: User, confirmedUser2: User): Match {
        this.log.debug(MatchFactory.name, this.fromRaw.name, "Executing");

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating id object");
        const _id = new MatchId(id);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating first user object");
        const _firstUser = user1;

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating second user object");
        const _secondUser = user2;

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating UserPair object");
        const _participants = new UserPair(_firstUser, _secondUser);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating Status object");
        const _status: MatchStatus = MatchStatus.fromString(status);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating link object");
        const _link: MatchLink = new MatchLink(link);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating schedule object");
        const _schedule: MatchSchedule= new MatchSchedule(schedule);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating matchcallnumber object");
        const _number = new MatchCallNumber(number);


        this.log.debug(MatchFactory.name, this.fromRaw.name, "Creating ConfirmedParticipants object.");
        const confirmedUserA = (_participants.contains(confirmedUser1)) ? confirmedUser1 : null;
        const confirmedUserB = (_participants.contains(confirmedUser2) && (!confirmedUser2.equals(confirmedUserA))) ? confirmedUser2 : null;
        const _confirmedParticipants = new ConfirmedParticipants(confirmedUserA, confirmedUserB);

        this.log.debug(MatchFactory.name, this.fromRaw.name, "Successfully created match object.");
        return new Match(_id, _participants, _schedule, _status, _link, _number, _confirmedParticipants);
    }
}
