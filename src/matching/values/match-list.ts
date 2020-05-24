 import PriorityQueue from "ts-priority-queue";
import { User } from "../entities/user";
import { MatchCandidate } from "./match-candidate";
import { MatchInfo } from "./match-info";


 /**
  * MatchList represents a list of potential matches for a user.
  */

export class MatchList {

    // The user looking for a match.
    public readonly user: User;

    // Potential matches.
    private readonly list: PriorityQueue<MatchCandidate>;

    constructor(user: User) {
        this.user = user;
        this.list = new PriorityQueue<MatchCandidate>({comparator: MatchList.Comparator()});
    }

    /**
     * Adds a candidate to the list.
     * @param candidate User
     */

    public add(candidate: MatchCandidate): boolean {
        this.list.queue(candidate);
        return true;
    }

    /**
     * gets the length of the list.
     */

    public length(): number {
        return this.list.length;
    }

    /**
     * Determines if the list is empty.
     */

    public isEmpty(): boolean {
        return this.length() === 0;
    }

    /**
     * Generates the best match for the user from the availability list.
     */

    public bestMatch(): MatchInfo {

        if (this.list.length > 0) {
            const candidate = this.list.dequeue();
            return new MatchInfo(this.user, candidate.user, candidate.schedule);
        }
        else {
            return null;
        }
    }

    /**
     * defines the comparator for the priority queue. This function determines the placement of the candidate in the queue.
     * 
     * If the comparator returns a number less than 0, candidate a comes before candidate b.
     * 
     * If the comparator reutrns a number greater than 0, candidate b comes before candidate a.
     * 
     * If comparator returns 0, the order does not matter and the priorities are treated equally.
     */
    private static Comparator(): (a: MatchCandidate, b: MatchCandidate) => number {
        const comparator = (a: MatchCandidate, b: MatchCandidate): number => {
            return b.compatibilityScore - a.compatibilityScore;
        }

        return comparator;
    }
}
