import { Name } from "../values/name";
import { PhoneNumber } from "../values/phone-number";
import { AvailabilityBlock } from "../values/availability-block";
import { Topic } from "../values/topic";
import { Email } from "../values/email";
import { UserId } from "../values/user-id";
import { CreationTime } from "../values/creation-time";
import { MatchReference } from "../values/match-reference";

export class User {
    public readonly id: UserId;
    public readonly name: Name;
    public readonly phone: PhoneNumber;
    public readonly availabilities: AvailabilityBlock[];
    public readonly topics: Topic[];
    public readonly isAdult: boolean;
    public readonly email: Email; 
    public readonly lastScheduledMatch: MatchReference;
    public readonly creation: CreationTime;

    constructor(id: UserId, name: Name, isAdult: boolean, email: Email, phone: PhoneNumber, availabilities: AvailabilityBlock[], topics: Topic[], lastMatch: MatchReference, created: CreationTime) {
        this.id = id; 
        this.name = name, this.isAdult = isAdult;
        this.email = email;
        this.phone = phone;
        this.availabilities = availabilities.sort((a: AvailabilityBlock, b: AvailabilityBlock) => {
            if (a.after(b)) return -1;
            if (b.after(a)) return 1;
            return 0;
        });
        this.topics = topics;
        this.lastScheduledMatch = lastMatch;
        this.creation = created; 
        this.isAdult = isAdult;
    }

    /**
     * Returns a list of the shared availabilities with the user other.
     * @param other User
     */
    public getSharedAvailabilitiesWith(other: User): AvailabilityBlock[] {
        if (!this.equals(other)) {
            const userList = this.availabilities;
            const otherList = other.availabilities;
            return userList.filter((userAvailability) => {
                return otherList.some((otherAvailability) => {
                    return userAvailability.equals(otherAvailability);
                });
            });
        }
        else {
            // it is the same user. Therere, you cannot share any availabilities.
            return [];
        }
    }

    public countSharedAvailabilitiesWith(other: User): number {
        return this.getSharedAvailabilitiesWith(other).length;
    }

    public hasSharedAvailabilityWith(other: User): boolean {
        return (!this.equals(other)) ? this.getSharedAvailabilitiesWith(other).length > 0 : false;
    }

    public lastMatchedWith(user: User): boolean {
        return (this.lastScheduledMatch) ? this.lastScheduledMatch.equals(user.lastScheduledMatch) : false;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof User) {
            const other = suspect as User;
            return this.id.equals(other.id);
        }
        return false;
    }

    public approachingLastAvailability(): boolean {
        return this.availabilities[0].isApproaching();
    }
}
