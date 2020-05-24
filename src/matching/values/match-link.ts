export class MatchLink {
    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchLink) {
            const other = suspect as MatchLink;
            return this.value === other.value;
        }
        return false;
    }
}
