


export class MatchStatus {
    public readonly value: string;
    private readonly option: MatchStatusOption;

    constructor(opt: MatchStatusOption) {
        this.option = opt;
        this.value = this.option.toString();
    }

    public static Pending(): MatchStatus {
        return new MatchStatus(MatchStatusOption.Pending);
    }

    public static Confirmed(): MatchStatus {
        return new MatchStatus(MatchStatusOption.Confirmed);
    }

    public static Canceled(): MatchStatus {
        return new MatchStatus(MatchStatusOption.Canceled);
    }

    public static Completed(): MatchStatus {
        return new MatchStatus(MatchStatusOption.Complete);
    }

    public static fromString(val: string): MatchStatus {
        
        let result: MatchStatus;

        switch(val) {
            case MatchStatusOption.Canceled.toString(): 
                result = MatchStatus.Canceled();
                break;
            case MatchStatusOption.Complete.toString(): 
                result = MatchStatus.Completed();
                break;
            case MatchStatusOption.Confirmed.toString():
                result = MatchStatus.Confirmed();
                break;
            case MatchStatusOption.Pending.toString(): 
                result = MatchStatus.Pending();
                break;
            default:
                result = new MatchStatus(MatchStatusOption.Invalid);
        }

        return result;
    }

    public isPending(): boolean {
        return this.equals(MatchStatus.Pending());
    }

    public isConfirmed(): boolean {
        return this.equals(MatchStatus.Confirmed());
    }

    public isCanceled(): boolean {
        return this.equals(MatchStatus.Canceled());
    }

    public isComplete(): boolean {
        return this.equals(MatchStatus.Completed());
    }

    public isInvalid(): boolean {
        return this.option === MatchStatusOption.Invalid;
    }

    public equals(suspect: any): boolean {
        if (suspect instanceof MatchStatus) {
            const other = suspect as MatchStatus;
            return this.option === other.option;
        }
        return false;
    }
}

export enum MatchStatusOption {
    "Pending",
    "Confirmed",
    "Canceled",
    "Complete",
    "Invalid"
}
