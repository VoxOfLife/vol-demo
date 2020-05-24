export class Name {
    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(other: any): boolean {
        if (other instanceof Name) {
            const target = other as Name;
            return this.value == target.value;
        }
        return false;
    }
}
