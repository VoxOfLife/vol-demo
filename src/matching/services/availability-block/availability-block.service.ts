import { Injectable, Inject } from '@nestjs/common';
import { AvailabilityBlock } from '../../values/availability-block';
import { AvailabilityBlockFactory } from '../../factories/availability-block-factory';
import { LogService } from 'src/log/services/log/log.service';

@Injectable()
export class AvailabilityBlockService {

    constructor(
        @Inject(AvailabilityBlockFactory) private readonly abFactory: AvailabilityBlockFactory,
        @Inject(LogService) private readonly log: LogService,
    ) {}

    public createManyFromDaysAndTimesList(days: string[], times: string[]): AvailabilityBlock[] {
        this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, "Executing");
        const availabilities: AvailabilityBlock[] = [];

        this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, "Checking if there are any availabilities to create.");
        if ((days) && (days.length > 0) && (times) && (times.length > 0)) {
            // there are availabilities to be created.
            
            this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, "Found availabilities to create.");
            days.forEach((day) => {
                times.forEach((time) => {
                    this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, `Creating avaialbility for ${day} at ${time}`);
                    const avaialbility = this.abFactory.fromDayAndTime(day, time)
                    
                    this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, `Successfully created avaialbility for ${avaialbility.schedule.toString()}`);
                    availabilities.push(avaialbility);
                });
            });
        }
        else {
            this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, "No availability blocks to create.");
        }

        this.log.debug(AvailabilityBlockService.name, this.createManyFromDaysAndTimesList.name, "Exiting");
        return availabilities;
    }

    public createManyFromDates(dates: Date[]): AvailabilityBlock[] {

        const availabilities: AvailabilityBlock[] = [];
        
        if ((dates) && (dates.length > 0)) {
            // we have availabilities to create

            dates.forEach((date) => {
                availabilities.push(new AvailabilityBlock(date));
            })
        }
        else {
            // we have nothing to make
        }

        return availabilities;
    }
}
