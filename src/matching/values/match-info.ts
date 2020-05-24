/**
 * Match represents a single match between two users.
 */

import { User } from "../entities/user";
import { AvailabilityBlock } from "./availability-block";

export class MatchInfo {
    public readonly x: User;
    public readonly y: User;
    public readonly schedule: AvailabilityBlock;

    constructor(a: User, b: User, schedule: AvailabilityBlock) {
        this.x = a;
        this.y = b;
        this.schedule = schedule;
    }

    public equals(suspect: any) {
        if (suspect instanceof MatchInfo) {
            const other = suspect as MatchInfo;
            return ((this.x.equals(other.x)) && (this.y.equals(other.y)) && (this.schedule.equals(other.schedule)));
        }
        return false;
    }

}
