import { AvailabilityBlock } from "src/matching/values/availability-block";
import { Day, DAY_OPTIONS } from "../values/day";
import { Time, TIME_OPTIONS } from "../values/time";
import { Injectable, Inject } from "@nestjs/common";
import { LogService } from "src/log/services/log/log.service";


/**
 * AvailabilityBlockFactory manages the creation of AvailabilityBlock objects.
 */

 @Injectable()
export class AvailabilityBlockFactory {


    constructor(@Inject(LogService) private readonly log: LogService) {}

    public fromDayAndTime(day: string, time: string): AvailabilityBlock {
        this.log.debug(AvailabilityBlockFactory.name, this.fromDayAndTime.name, "Executing");
        const availability = AvailabilityBlock.fromDayandTime(this.calculateDay(day), this.calculateTime(time));
        this.log.debug(AvailabilityBlockFactory.name, this.fromDayAndTime.name, "Successfully created availability.");
        this.log.debug(AvailabilityBlockFactory.name, this.fromDayAndTime.name, "Exiting");
        return availability;
    }

    private calculateDay(daystr: string): Day {
        this.log.debug(AvailabilityBlockFactory.name, this.calculateDay.name, "Executing");
        let day: Day;

        this.log.debug(AvailabilityBlockFactory.name, this.calculateDay.name, "Creating Day object for: " + daystr);
        switch(daystr) {
            case DAY_OPTIONS.SUNDAY: 
                day = Day.SUNDAY();
                this.log.debug(AvailabilityBlockFactory.name, this.calculateDay.name, "Executing");
                break;
            case DAY_OPTIONS.MONDAY: 
                day = Day.MONDAY();
                break;
            case DAY_OPTIONS.TUESDAY: 
                day = Day.TUESDAY();
                break;
            case DAY_OPTIONS.WEDNESDAY:
                day = Day.WEDNESDAY();
                break;
            case DAY_OPTIONS.THURSDAY:
                day = Day.THURSDAY();
                break;
            case DAY_OPTIONS.FRIDAY:
                day = Day.FRIDAY();
                break;
            case DAY_OPTIONS.SATURDAY:
                day = Day.SATURDAY();
                break;
        }

        this.log.debug(AvailabilityBlockFactory.name, this.calculateDay.name, "Successfully created Day object.");
        this.log.debug(AvailabilityBlockFactory.name, this.calculateDay.name, "Exitting");

        return day;
    }

    private calculateTime(timestr: string): Time {
        this.log.debug(AvailabilityBlockFactory.name, this.calculateTime.name, "Executing");
        let time: Time;

        this.log.debug(AvailabilityBlockFactory.name, this.calculateTime.name, "Creating Time object for time string" + timestr);

        switch(timestr) {
            case TIME_OPTIONS.ET_10AM:
                time = Time.ET_10AM();
                break;
            case TIME_OPTIONS.ET_12PM:
                time = Time.ET_12PM();
                break;
            case TIME_OPTIONS.ET_3PM:
                time = Time.ET_3PM();
                break;
            case TIME_OPTIONS.ET_6PM:
                time = Time.ET_6PM();
                break;
            case TIME_OPTIONS.ET_9PM:
                time = Time.ET_9PM();
        }

        this.log.debug(AvailabilityBlockFactory.name, this.calculateTime.name, "Successfully created Time Object with hour: ." + time.hour + " and minute: " + time.minute);
        this.log.debug(AvailabilityBlockFactory.name, this.calculateTime.name, "Exiting");
        return time;
    }

}
