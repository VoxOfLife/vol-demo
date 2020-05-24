export class MatchReference {

    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchReference) {
            const other = suspect as MatchReference;
            return this.value === other.value;
        }
        return false;
    }
}
