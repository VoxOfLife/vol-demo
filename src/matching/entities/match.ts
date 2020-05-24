
/**
 * Match
 * 
 * An Entity representing a match.
 */

import { MatchId } from "../values/match-id";
import { UserPair } from "../values/user-pair";
import { MatchSchedule } from "../values/match-schedule";
import { MatchStatus } from "../values/match-status";
import { MatchLink } from "../values/match-link";
import { MatchCallNumber } from "../values/match-call-number";
import { ConfirmedParticipants } from "../values/confirmed-participants";
import { User } from "./user";

export class Match {
    public readonly id: MatchId;
    public readonly participants: UserPair;
    public readonly schedule: MatchSchedule
    public readonly status: MatchStatus;
    public readonly link: MatchLink;
    public readonly number: MatchCallNumber;
    public readonly confirmedParticipants: ConfirmedParticipants;


    constructor(id: MatchId, participants: UserPair, schedule: MatchSchedule, status: MatchStatus, link: MatchLink, number: MatchCallNumber, confirmedParticipants: ConfirmedParticipants) {
        this.id = id;
        this.participants = participants;
        this.schedule = schedule;
        this.status = status;
        this.link = link;
        this.number = number;
        this.confirmedParticipants = confirmedParticipants;
    }

    /**
     * Updates the match status.
     * @param newStatus the new status
     */

    public updateStatus(newStatus: MatchStatus): Match {
        return new Match(this.id, this.participants, this.schedule, newStatus, this.link, this.number, this.confirmedParticipants);
    }

    /**
     * Confirms a user in the match.
     * @param user the user to confirm.
     */

    public confirmParticipant(user: User): Match {

        let isSet = false
        
        if ((this.status.isPending()) && (!this.userIsConfirmed(user)) && (this.userIsParticipant(user))) {
            
            let confirmedUserA: User;
            let confirmedUserB: User;

            if (this.confirmedParticipants.a) {
                confirmedUserA = this.confirmedParticipants.a;
            }
            else {
                confirmedUserA = user;
                isSet = true;
            }

            if (this.confirmedParticipants.b) {
                confirmedUserB = this.confirmedParticipants.b;
            }
            else if (!isSet) {
                confirmedUserB = user;
            }

            const confirmedParticipants = new ConfirmedParticipants(confirmedUserA, confirmedUserB);

            return new Match(this.id, this.participants, this.schedule, this.status, this.link, this.number, confirmedParticipants);
        }
        else {
            throw new Error("Cannot Confirm user.");
        }
    }

    /**
     * Determines if the current match can be confirmed.
     */

    public canBeConfirmed(): boolean {
        return this.confirmedParticipants.populated();
    }

    /**
     * Confirms the current match.
     */

    public confirm(): Match {
        if (this.canBeConfirmed()) {
            return new Match(this.id, this.participants, this.schedule, MatchStatus.Confirmed(), this.link, this.number, this.confirmedParticipants);
        }
        else {
            throw new Error("Cannot be Confirmed.");
        }
    }

    /**
     * cancels a match. 
     * 
     * If a match cannot be canceled, an error is thrown
     */

    public cancel(): Match {
        if (this.canBeCancelled()) {
            return new Match(this.id, this.participants, this.schedule, MatchStatus.Canceled(), this.link, this.number, this.confirmedParticipants);
        }
        else {
            throw new Error("Cannot be cancelled.");
        }
    }

    public isComplete(): boolean {
        return this.status.isComplete();
    }

    public isCancelled(): boolean {
        return this.status.isCanceled();
    }

    public isConfirmed(): boolean {
        return this.status.isConfirmed();
    }

    public isPending(): boolean {
        return this.status.isPending();
    }

    /**
     * Determines if a match can be canceled.
     */

    public canBeCancelled(): boolean {
        return this.status.isPending();
    }

    /**
     * Determines if a match can be completed.
     */

    public canBeCompleted(): boolean {
        return this.status.isConfirmed() && this.schedule.isBefore(new MatchSchedule(new Date()));
    }

    /**
     * Completes a match.
     */

    public complete(): Match {
        if (this.canBeCompleted()) {
            return new Match(this.id, this.participants, this.schedule, MatchStatus.Completed(), this.link, this.number, this.confirmedParticipants);
        }
        else {
            throw new Error("Cannot be Completed");
        }
    }

    /**
     * Determines if a user is confirmed for the match.
     * @param user the user to be tested.
     */

    public userIsConfirmed(user: User): boolean {
        return this.confirmedParticipants.contains(user);
    }

    /**
     * Determines if the user is a participant in the match.
     * @param user the user to test.
     */

    public userIsParticipant(user: User): boolean {
        return this.participants.contains(user);
    }


    /**
     * Determines if the current match and the suspect are equal.
     * @param suspect the suspect to test 
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof Match) {
            const other = suspect as Match;
            return this.id.equals(other.id);
        }
        return false;
    }


}
