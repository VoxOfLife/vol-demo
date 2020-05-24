import { Moment } from "moment";
import { Day } from "./day";
import { Time } from "./time";
import moment from "moment-timezone";
import { ConfigService } from "@nestjs/config";

export class AvailabilityBlock {


    public readonly schedule: Date;
    private readonly desiredDate: Moment;

    private readonly config: ConfigService;
    private readonly daysForApproaching: number;

    constructor(date: Date) {

        // initialize the config service
        this.config = new ConfigService();

        // initialize config values.
        this.daysForApproaching = this.config.get("matching.matchByDaysPrior");

        this.desiredDate = moment(date).utc();
        this.schedule = new Date(date.toUTCString());
    }

    public static fromDayandTime(day: Day, time: Time): AvailabilityBlock {
        // get the current date.
        const currentDate: Moment = moment().tz("Etc/GMT");

        /**
         * We calculate the desired date from the current date. The desired date is the next Day property following the 
         * currnet date. To do this, we use the following formula:
         * 
         * desiredDate = current date + |desiredDay - currentDay|. 
         */
        const daysToAdd = Math.abs(day.value - currentDate.day());
        let desiredDate = currentDate.add(daysToAdd, 'days');

        // set the time for the desired date.
        // TODO: Timesare in ET time zone. Convert to UTC before calculating.
        desiredDate = desiredDate.hour(time.hour).minute(time.minute).second(0).millisecond(0).utc();
        return new AvailabilityBlock(desiredDate.toDate());
    }

    /**
     * determines if the current availability block is equal to the suspect.
     * @param suspect any
     */

    public equals(suspect: any): boolean {
        if (suspect instanceof AvailabilityBlock) {
            const other = suspect as AvailabilityBlock;
            return this.schedule.getTime() === other.schedule.getTime();
        }
        return false;
    }

    /**
     * Determines if the avaialbility block is before the target.
     * @param target The target availability block
     */

    public before(target: AvailabilityBlock): boolean {
        return this.desiredDate.isBefore(target.desiredDate);
    }

    public after(target: AvailabilityBlock): boolean {
        return this.desiredDate.isAfter(target.desiredDate);
    }

    /**
     * isApproaching()
     * 
     * isApproaching() determines if the schedule date is approaching.
     */

    public isApproaching(): boolean {
        const today: Moment = moment.utc();
        const suspectDate = today.add(this.daysForApproaching, "days");
        return suspectDate.isAfter(this.desiredDate) || suspectDate.isSame(this.desiredDate);
    }
}
