export class Email {
    public readonly value: string;

    constructor(val: string) {
        this.value = val;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof Email) {
            const other = suspect as Email;
            return this.value === other.value;
        }
        return false;
    }
}
