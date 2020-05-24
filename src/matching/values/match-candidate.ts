/**
 * A match candidate is a candidation for a potential user match.
 */

import { User } from "../entities/user";
import { AvailabilityBlock } from "./availability-block";

export class MatchCandidate {
    public readonly user: User;
    public readonly compatibilityScore: number;
    public readonly schedule: AvailabilityBlock;

    constructor(user: User, schedule: AvailabilityBlock,  score: number) {
        this.user = user;
        this.compatibilityScore = score;
        this.schedule = schedule;
    }

    /**
     * determines if the current MatchCandidate instance and the suspect are equal.
     * @param suspect any
     */

    public equals(suspect: any) {
        if (suspect instanceof MatchCandidate) {
            const other = suspect as MatchCandidate;
            return ((this.user.equals(other.user)) && (this.compatibilityScore === other.compatibilityScore));
        }
        return false;
    }
}
