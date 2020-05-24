import { User } from "../entities/user";

export class UserPair {
    public readonly a: User;
    public readonly b: User;

    constructor(x: User, y: User) {
        this.a = x;
        this.b = y;
    }

    public contains(user: User): boolean {
        let result = false; 

        if (user) {
            result = user.equals(this.a) || user.equals(this.b);
        }

        return result;
    }

    /**
     * Determines if the suspect is equal to the user pair.
     * @param suspect any
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof UserPair) {
            const other = suspect as UserPair;
            return (this.a.equals(other.a) && this.b.equals(other.b)) || (this.a.equals(other.b) && this.b.equals(other.a));
        }
        return false;
    }
}
