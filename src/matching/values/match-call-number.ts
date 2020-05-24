export class MatchCallNumber {

    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchCallNumber) {
            const other = suspect as MatchCallNumber;
            return this.value === other.value;
        }
        return false;
    }

}
