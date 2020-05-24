export class Day {
    public readonly value: number;
    public readonly dayOfWeek: string;

    private constructor(dayOfWeek: string, val: number) {
        this.value = val;
        this.dayOfWeek = dayOfWeek;
    }

    /**
     * Instantiate a day as Wednesday.
     */

    public static SUNDAY(): Day {
        return new Day(DAY_OPTIONS.SUNDAY, 0);
    }

    public static MONDAY(): Day {
        return new Day(DAY_OPTIONS.MONDAY, 1);
    }

    public static TUESDAY(): Day {
        return new Day(DAY_OPTIONS.TUESDAY, 2);
    }

    /**
     * Instanciates a day as Wednesday.
     */

    public static WEDNESDAY(): Day {
        return new Day(DAY_OPTIONS.WEDNESDAY, 3);
    }

    public static THURSDAY(): Day {
        return new Day(DAY_OPTIONS.THURSDAY, 4);
    }

    /**
     * Instanciate a day as Friday.
     */

    public static FRIDAY(): Day {
        return new Day(DAY_OPTIONS.FRIDAY, 5);
    }

    /**
     * Instantiates a Day as Saturday.
     */

    public static SATURDAY(): Day {
        return new Day(DAY_OPTIONS.SATURDAY, 6);
    }

    

    public equals(suspect: any): boolean {
        if (suspect instanceof Day) {
            const other = suspect as Day;
            return this.value == other.value;
        }
        return false;
    }
}

export enum DAY_OPTIONS{
    SUNDAY = "Sunday",
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday"
};
