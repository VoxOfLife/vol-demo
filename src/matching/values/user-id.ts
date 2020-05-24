

export class UserId {
    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof UserId) {
            const other = suspect as UserId;
            return this.value === other.value;
        }
        return false;
    }
}
