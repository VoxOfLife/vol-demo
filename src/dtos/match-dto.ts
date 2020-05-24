import { MatchParticipantsDto } from "./match-participants-dto";
import { ConfirmedUsersDto } from "./confirmed-users-dto";

export class MatchDto {
    id: string;
    participants: MatchParticipantsDto;
    schedule: Date;
    status: string;
    link: string;
    number: string;
    confirmedParticipants: ConfirmedUsersDto;
}
