

export class MatchId {
    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchId) {
            const other = suspect as MatchId;
            return this.value === other.value;
        }
        return false;
    }
}
