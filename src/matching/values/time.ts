import { TIMEOUT } from "dns";

export class Time {
    public readonly label: string;
    public readonly hour: number;
    public readonly minute: number;

    private constructor(hour: number, minute: number, label: string) {
        this.label = label;
        this.hour = hour;
        this.minute = minute;
        
    }

    /**
     * Instanciates a Time as 3PM ET.
     */
    public static ET_3PM(): Time {
        return  new Time(15, 0, TIME_OPTIONS.ET_3PM);
    }

    /**
     * Instantiates a time as 10AM ET
     */
    public static ET_10AM(): Time {
        return new Time(10, 0, TIME_OPTIONS.ET_10AM);
    }

    /**
     * Instantiates a time as 6PM ET.
     */

    public static ET_6PM(): Time {
        return new Time(18, 0, TIME_OPTIONS.ET_6PM);
    }

    /**
     * Instanciates a time as 9PM ET.
     */

    public static ET_9PM(): Time {
        return new Time(21, 0, TIME_OPTIONS.ET_9PM);
    }

    /**
     * Instantiates a time as 12PM ET.
     */

    public static ET_12PM(): Time {
        return new Time(12, 0, "12 PM ET");
    }

    /**
     * detemines if the time is equal to the suspect.
     * @param suspect any
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof Time) {
            const other = suspect as Time;
            return (this.hour == other.hour) && (this.minute == other.minute) && (this.label == other.label);
        }
        return false;
    }
}

export enum TIME_OPTIONS{
    ET_10AM = "10 AM ET",
    ET_12PM = "12 PM ET",
    ET_3PM = "3 PM ET",
    ET_6PM = "6 PM ET",
    ET_9PM = "9 PM ET"
};
