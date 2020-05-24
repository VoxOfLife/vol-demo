import AwesomePhone from "awesome-phonenumber";

export class PhoneNumber {
    public readonly value: string;
    private phoneParser: AwesomePhone;

    constructor(val: string) {
        this.phoneParser = new AwesomePhone(val, "US");
        this.value = this.phoneParser.getNumber();
    }

    public getE164Number(): string {
        return this.phoneParser.getNumber("e164");
    }

    public equals(target: any): boolean {
        if (target instanceof PhoneNumber) {
            const other = target as PhoneNumber;
            return this.value == other.value;
        }
        return false;
    }
}
