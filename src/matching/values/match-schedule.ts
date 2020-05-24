import moment from "moment-timezone";
import { Moment } from "moment";

export class MatchSchedule {
    private readonly schedule: Moment;
    public readonly value: Date;

    constructor(val: Date) {
        this.schedule = moment(val).utc();
        this.value = this.schedule.toDate();
    }

    /**
     * determines if the match schedule is after other.
     * @param other The MatchSchedule being compared
     */

    public isAfter(other: MatchSchedule): boolean {
        return this.schedule.isAfter(other.schedule);
    }

    /**
     * Determines if the match schedule is before other,
     * @param other The MatchSchedule being compared.
     */

    public isBefore(other: MatchSchedule): boolean {
        return this.schedule.isBefore(other.schedule);
    }

    /**
     * Determines if two match schedules are equal.
     * @param suspect the matching schedule being compared.
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchSchedule) {
            const other = suspect as MatchSchedule;
            return this.value.getTime() === other.value.getTime();
        }
        return false;
    }
}
