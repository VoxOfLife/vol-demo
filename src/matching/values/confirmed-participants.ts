import { User } from "../entities/user";

export class ConfirmedParticipants {
    public readonly a: User;
    public readonly b: User;

    constructor(a: User, b: User) {
        this.a = a;
        this.b = b;
    }

    public hasUser(user: User): boolean {
        return user.equals(this.a) || user.equals(this.b);
    }

    public populated(): boolean {
        return (this.a != null) && (this.b != null);
    }

    public contains(user: User): boolean {
        return this.a.equals(user) || this.b.equals(user);
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof ConfirmedParticipants) {
            const other = suspect as ConfirmedParticipants;

            if ((this.a) && (this.b) && (other.a) && (other.b)) {
                return ((this.a.equals(other.a)) && (this.b.equals(other.b))) || ((this.a.equals(other.b)) && (this.b.equals(other.a)));
            }
            return false;
        }
        return false;
    }

}
