export class CreationTime {
    public readonly value: Date;

    constructor(val: Date) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof CreationTime) {
            const other = suspect as CreationTime;
            return this.value === other.value;
        }
        return false;
    }
}
