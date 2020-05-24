import { Injectable, Inject, forwardRef, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { LogService } from 'src/log/services/log/log.service';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from "@nestjs/schedule";
import { UsersRepository } from '../../repositories/users-repository';
import { MatchInfo } from '../../values/match-info';
import { User } from "../../entities/user";
import { MatchCandidate } from '../../values/match-candidate';
import { MatchList } from '../../values/match-list';
import { AvailabilityBlock } from '../../values/availability-block';
import { MatchesRepository } from '../../repositories/matches-repository';
import { Match } from '../..//entities/match';
import { MatchSchedule } from '../..//values/match-schedule';
import { NotificationService } from 'src/notifications/services/notification/notification.service';
import { MatchObjectConverterService } from '../match-object-converter/match-object-converter.service';

@Injectable()
export class MatchingService {

    private readonly sharedAvailabilityFactor: number;
    private readonly noPriorMatchFactor: number;
    private readonly matchDeadlineApproachingFactor: number;

    // stats variables
    private unmatchedUserCount: number;
    private createdMatchCount: number;
    private deferredMatchCount: number;
    private volunteerMatchCount: number;

    constructor(
        @Inject(LogService) private readonly logService: LogService,
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(forwardRef(() => UsersRepository)) private readonly usersRepo: UsersRepository,
        @Inject(forwardRef(() => MatchesRepository)) private readonly matchesRepo: MatchesRepository,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(MatchObjectConverterService) private readonly matchConverter: MatchObjectConverterService,
    ) {
        this.sharedAvailabilityFactor = this.config.get('matching.compatibilityScore.weights.sharedAvailability');
        this.noPriorMatchFactor = this.config.get("matching.compatibilityScore.weights.noPriorMatch");
        this.matchDeadlineApproachingFactor = this.config.get("matching.compatibilityScore.weights.matchDeadlineApproaching");

        // stat count
        this.unmatchedUserCount = 0;
        this.createdMatchCount = 0;
        this.deferredMatchCount = 0;
        this.volunteerMatchCount = 0;
    }


    /**
     * Confirms a match.
     * @param user The user sending the request.
     * @param match the match to be confirmed.
     */

    public async confirmMatch(user: User, match: Match): Promise<Match> {

        try {
            // make sure the match is not canceled and the user is a participant of the match.
            if (match.isCancelled() || !match.userIsParticipant(user)) {
                throw new BadRequestException();
            }

            // confirm the user
            match = match.confirmParticipant(user);

            // check if the match can be confirmed
            if (match.canBeConfirmed()) {
                match = match.confirm();
            }

            // save changes.
            match = await this.matchesRepo.save(match);

            // return the match
            return match;
        }
        catch (err) {
            const error = err as Error;
            this.logService.error(MatchingService.name, this.confirmMatch.name, error.message, error.stack);
            throw new InternalServerErrorException();
        }
    }

    /**
     * Cancels a match.
     * @param user the user sending the request.
     * @param match The match to be canceled.
     */

    public async declineMatch(user: User, match: Match): Promise<Match> {

        // make sure the match can be cancelled and that the user is a participant in the match.
        if ((!match.canBeCancelled()) || ((!match.userIsParticipant(user)))) {
            throw new BadRequestException();
        }

        // cancel the match
        match = match.cancel();

        // save changes.
        match = await this.matchesRepo.save(match);

        // return the saved match.
        return match;

    }

    // CRON Jobs

    /**
     * completeMatches()
     * 
     * completeMatches() marks all completed matches as "Complete"
     */

    //@Cron(CronExpression.EVERY_MINUTE) // Runs every 2 hours.
    private async completeMatches(): Promise<void> {

        this.logService.debug(MatchingService.name, this.completeMatches.name, "Executing Completion Routine");
        this.logService.debug(MatchingService.name, this.completeMatches.name, "Initializing");

        // The total completed matches.
        let totalCompletedMatches = 0;
        
        // the total number of ongoing matches.
        let totalOngoingMatches = 0;

        // get unconfirmed matches scheduled for the day.
        this.logService.debug(MatchingService.name, this.completeMatches.name, "Getting ongoing matches.");
        const ongoingMatches = await this.matchesRepo.getOngoingMatches();
        this.logService.debug(MatchingService.name, this.completeMatches.name, "Successfully got ongoing matches.");
        const completedMatches: Match[] = [];
        const ongoingCount = ongoingMatches.length;
        totalOngoingMatches = ongoingCount;

        this.logService.debug(MatchingService.name, this.completeMatches.name, "Checking if there are matches to cancel.");

        if (ongoingCount > 0) {
            this.logService.debug(MatchingService.name, this.completeMatches.name, "Completing ongoing matches.");

            // complete the matches.

            let i = 0;
            for (i = 0; i < ongoingCount; i++) {
                let match = ongoingMatches[i];

                this.logService.debug(MatchingService.name, this.completeMatches.name, `Completing match ${match.id.value}`);
                match = match.complete();

                this.logService.debug(MatchingService.name, this.completeMatches.name, `Saving changes.`);
                match = await this.matchesRepo.save(match);
                this.logService.debug(MatchingService.name, this.completeMatches.name, `Successfully saved changes to match ${match.id.value}`);
                completedMatches.push(match);

                this.logService.debug(MatchingService.name, this.completeMatches.name, `Sending cancellation notification to match ${match.id.value}`);
                const dto = this.matchConverter.toDto(match);
                await this.notificationService.sendPostMatchNotification(dto);
                this.logService.debug(MatchingService.name, this.completeMatches.name, `Successfully Sent notifications to match ${match.id.value}`);
            }
        }
        else {
            // no matches to complete.
            this.logService.debug(MatchingService.name, this.completeMatches.name, "No matches to complete.");
        }

        // compute the stats.
        this.logService.debug(MatchingService.name, this.completeMatches.name, "OPERATION SUMMARY");
        this.logService.debug(MatchingService.name, this.completeMatches.name, `Total Ongoing Matches: ${totalOngoingMatches}`);
        this.logService.debug(MatchingService.name, this.completeMatches.name, `Total Completed Matches: ${completedMatches.length}`);


        this.logService.debug(MatchingService.name, this.completeMatches.name, "Operation Complete");
    }


    /**
     * automatically cancels unconfirmed matches
     */

    //@Cron(CronExpression.EVERY_DAY_AT_6AM)
    private async autocancelUnconfirmedMatches(): Promise<void> {

        this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Executing");

        // get unconfirmed matches scheduled for the day.
        this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Get the unconfirmed matches for today.");
        const unconfirmedMatches = await this.matchesRepo.getPendingMatchesForToday();
        this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Successfully got unconfirmed matches.");
        const cancelledMatches: Match[] = [];
        const unconfirmedCount = unconfirmedMatches.length;

        this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Checking if there are matches to cancel.");

        if (unconfirmedCount > 0) {
            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Cancelling unconfirmed matches.");
        }
        else {
            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "No matches to cancel.");
        }

        // cancel the matches.

        let i = 0;
        for (i = 0; i < unconfirmedCount; i++) {
            let match = cancelledMatches[i];

            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, `Cancelling match ${match.id.value}`);
            match = match.cancel();

            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, `Saving changes.`);
            match = await this.matchesRepo.save(match);
            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, `Successfully saved changes to match ${match.id.value}`);

            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, `Sending cancellation notification to match ${match.id.value}`);
            const dto = this.matchConverter.toDto(match);
            await this.notificationService.sendMatchCancellationNotification(dto);
            this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, `Successfully Sent notifications to match ${match.id.value}`);
        }

        this.logService.debug(MatchingService.name, this.autocancelUnconfirmedMatches.name, "Operation Complete");
    }



    /**
     * generateMatches()
     * 
     * generateMatches() attempts to create matches for unmatched users. 
     * There are times when we cannot find a match for a user. In these 
     * situations, we will do one of the following:
     * 
     * If the user's last preferred time slot of the week is at most 2 days 
     * away, we will match the user with a volunteer. Otherwise, we will delay 
     * matching the user until the next cycle.
     */

    //@Cron(CronExpression.EVERY_10_MINUTES) // CRON job runs every six hours.
    private async generateMatches(): Promise<void> {
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Executing Match Generation");

        // initialize variables
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Initializing");
        this.unmatchedUserCount = 0;
        this.createdMatchCount = 0;
        this.volunteerMatchCount = 0;
        this.deferredMatchCount = 0;


        // get the unmatched records.
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Getting unmatched users");
        const users = await this.usersRepo.getUnmatchedUsers();
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Successfully obtained unmatched users.");

        // for stats, get the number of unmatched users.
        this.unmatchedUserCount = users.length;

        // make sure there are users to match.
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Checking if there are users to match.");

        if (users.length > 1) {

            // we have users to match.
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Found users that can be matched.");

            // match users
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Creating user matches.");
            const matchesInfo = this.createMatchesFromList(users);
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Successfully created user matches.");
            this.createdMatchCount = matchesInfo.length;

            // save the matches.
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Saving user matches.");

            const matches: Match[] = [];
            const length = matchesInfo.length;
            let index = 0;
            for (index = 0; index < length; index++) {
                const matchData = matchesInfo[index];
                this.logService.debug(MatchingService.name, this.generateMatches.name, `Creating match between ${matchData.x.id.value} and ${matchData.y.id.value} on ${matchData.schedule.schedule.toUTCString()}`);
                const match: Match = await this.matchesRepo.create(matchData.x, matchData.y, new MatchSchedule(matchData.schedule.schedule));
                this.logService.debug(MatchingService.name, this.generateMatches.name, "Successfully created match: " + match.id.value);

                this.logService.debug(MatchingService.name, this.generateMatches.name, `Adding match ${match.id.value} to matches.`);
                matches.push(match);
                this.logService.debug(MatchingService.name, this.generateMatches.name, `Successfully added match ${match.id.value} to matches.`);
            }
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Successfully saved user matches.");

            // send match notifications
            this.logService.debug(MatchingService.name, this.generateMatches.name, "Sending notifications.");
            await this.sendMatchNotifications(matches);


        }
        else {
            // no users to matfh.
            this.logService.debug(MatchingService.name, this.generateMatches.name, "No Users to match.");
        }


        // completed successfully
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Match generation complete.");
        this.logService.debug(MatchingService.name, this.generateMatches.name, "-----------SUMMARY---------");
        this.logService.debug(MatchingService.name, this.generateMatches.name, `Total Unmatched Users: ${this.unmatchedUserCount}`);
        this.logService.debug(MatchingService.name, this.generateMatches.name, `Total Matches Created: ${this.createdMatchCount}`);
        this.logService.debug(MatchingService.name, this.generateMatches.name, `Total Volunteer Matches: ${this.volunteerMatchCount}`);
        this.logService.debug(MatchingService.name, this.generateMatches.name, `Total Deferred Users: ${this.deferredMatchCount}`);
        this.logService.debug(MatchingService.name, this.generateMatches.name, "Operation Complete..");
    }

    // helpers

    /**
     * Creates a list of matches.
     * @param userList A list of users to be matched.
     */

    private createMatchesFromList(userList: User[]): MatchInfo[] {
        this.logService.debug(MatchingService.name, this.createMatchesFromList.name, "Executing");
        let listLength: number;
        let candidateList: User[];

        // the list of matches.
        const matchList: MatchInfo[] = [];

        // get the list of users.
        candidateList = userList;
        listLength = userList.length;


        while (listLength > 0) {

            // get the user we are trying to find a match for.
            const user: User = candidateList[0];

            // get the length of the candidate list.
            listLength = candidateList.length;

            // get a match for the user.
            this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Generating match for user: ${user.id.value}`);
            const possibleMatches = candidateList.filter((candidate) => {

                const status = user.hasSharedAvailabilityWith(candidate);
                (status) ? this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `User ${user.name.value} shares availability with ${candidate.name.value}`) :
                    this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `User ${user.name.value} does NOT share availability with ${candidate.name.value}`);

                return status;
            });

            let match = this.findMatch(user, possibleMatches);

            if (match) {
                // a match was created.

                // add match to the match list.
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Match for user: ${user.id.value} successfully generated.`);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `User: ${match.x.id.value} successfully matched with user: ${match.y.id.value}`);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Adding match to matchlist.`);
                matchList.push(match);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Successfully added match to match list.`);

                // update the list of candidates.
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Removing users ${match.x.id.value} and ${match.y.id.value} from candiate list`);
                candidateList = this.removeMatchFromList(match, candidateList);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Successfully removed users ${match.x.id.value} and ${match.y.id.value} from candiate list`);

            }
            else {
                // remove the user from the candidate list.
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Could not find match for user ${user.id.value} from candiate list`);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Deferring match for user ${user.id.value} to next cycle.`);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Removing user ${user.id.value} from candiate list`);
                candidateList = this.removeUserFromList(user, candidateList);
                this.logService.debug(MatchingService.name, this.createMatchesFromList.name, `Successfully removed user ${user.id.value} from candiate list`);
                this.deferredMatchCount++;
            }

            listLength = candidateList.length;
        }

        this.logService.debug(MatchingService.name, this.createMatchesFromList.name, "Successfully created Match list.");
        this.logService.debug(MatchingService.name, this.createMatchesFromList.name, "Exiting,");

        return matchList;
    }

    /**
     * fiinds a match for the given user.
     * @param user 
     * @param candidates 
     */

    private findMatch(user: User, candidates: User[]): MatchInfo {
        this.logService.debug(MatchingService.name, this.findMatch.name, "Executing.");
        let match: MatchInfo;

        this.logService.debug(MatchingService.name, this.findMatch.name, "Getting match list");
        const candidateList = this.getMatchList(user, candidates);

        this.logService.debug(MatchingService.name, this.findMatch.name, "Successfully generated match list");

        if (!candidateList.isEmpty()) {
            // we have a match
            this.logService.debug(MatchingService.name, this.findMatch.name, "Getting best match for user:" + user.id.value);
            match = candidateList.bestMatch();
            this.logService.debug(MatchingService.name, this.findMatch.name, "Successfully found match for user.");
        }
        else {
            // could not find a match.
            this.logService.debug(MatchingService.name, this.findMatch.name, "Could not find a match for user: " + user.id.value);

            // Determine if the user should be matched with a volunteer.
            if (user.approachingLastAvailability()) {
                // we could not find a match for the user. So, match them with the internal staff and volunteers.
                this.logService.debug(MatchingService.name, this.findMatch.name, `Matching user ${user.id.value} with volunteer.`);

                /// TODO: Code Match logic to match with volunteer.

                // get volunteers

                // prioritize volunteer based on number of sessions and similr availability with the user

                // get first volunteer from the list

                // create the match

                // add to stats
                this.volunteerMatchCount++;

                // return the match
            }
        }

        this.logService.debug(MatchingService.name, this.findMatch.name, "Exiting successfully.");
        return match;
    }

    /**
     * Gets a list of matches for user.
     * @param user User
     * @param candidates User[]
     */

    private getMatchList(user: User, candidates: User[]): MatchList {
        this.logService.debug(MatchingService.name, this.getMatchList.name, "Executing");

        const list = new MatchList(user);

        // prioritize the candidates.
        candidates.forEach((candidate) => {
            const priority = this.calculateCompatibilityScore(list.user, candidate);

            this.logService.debug(MatchingService.name, this.getMatchList.name, `Successfully calculated match score for candidate ${candidate.id.value} to be: ${priority}`);

            // get the earliest schedule
            this.logService.debug(MatchingService.name, this.getMatchList.name, "Gettubg schedule for candidate: " + candidate.id.value);
            const schedule = this.getBestSchedule(list.user.getSharedAvailabilitiesWith(candidate));

            // add the candidate to the list.
            this.logService.debug(MatchingService.name, this.getMatchList.name, `Adding candidate ${candidate.id.value} to match list.`);
            list.add(new MatchCandidate(candidate, schedule, priority));
            this.logService.debug(MatchingService.name, this.getMatchList.name, `Successfully Added candidate ${candidate.id.value} to match list.`);
        });

        this.logService.debug(MatchingService.name, this.getMatchList.name, "Successfully created list.");
        this.logService.debug(MatchingService.name, this.getMatchList.name, "Exiting");

        return list;
    }

    /**
     * Gets the best schedule for the match
     * @param list the list of schedules to choose from.
     */
    private getBestSchedule(list: AvailabilityBlock[]): AvailabilityBlock {
        return list[0];
    }

    /**
     * Removes the matched users from the candidates list.
     * @param match the match
     * @param list the list of candidates
     */

    private removeMatchFromList(match: MatchInfo, list: User[]): User[] {
        return list.filter((candidate) => (!candidate.id.equals(match.x.id)) && (!candidate.id.equals(match.y.id)));
    }

    /**
     * Removes a single user from the list.
     * @param user The user to be removed.
     * @param list The list to remove the user from.
     */

    private removeUserFromList(user: User, list: User[]): User[] {
        return list.filter((usr) => !usr.equals(user));
    }

    /**
     * 
     * @param user 
     * @param candidate 
     */

    private calculateCompatibilityScore(user: User, candidate: User): number {
        // calculate the compatibility score.
        this.logService.debug(MatchingService.name, this.getMatchList.name, "Calculating match score of candidate: " + candidate.id.value);
        let priority = 0;
        this.logService.debug(MatchingService.name, this.getMatchList.name, "Considering if candidate" + candidate.id.value + " has shared avaialbility with user" + user.id.value);
        priority += user.countSharedAvailabilitiesWith(candidate) * this.sharedAvailabilityFactor;
        this.logService.debug(MatchingService.name, this.getMatchList.name, "Considering if candidate" + candidate.id.value + " was previously matched with user " + user.id.value);
        priority += !user.lastMatchedWith(candidate) ? this.noPriorMatchFactor : 0;

        return priority;
    }

    public async sendMatchNotifications(matches: Match[]): Promise<void> {
        this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, "Executing");

        this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, "Checking if there are any notifications to sned.");
        const matchListLength = (matches) ? matches.length : 0;

        if (matchListLength > 0) {

            this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, "Found matches to send notifications.");

            let i = 0;
            for (i = 0; i < matchListLength; i++) {
                const match = matches[i];
                this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, `Sending notification for match: ${match.id.value}`);
                await this.notificationService.sendMatchNotification(this.matchConverter.toDto(match));
                this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, `Successfully sent notification for match: ${match.id.value}`);
            }

            // completed
            this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, "Successfully sent notifications.");
            this.logService.debug(MatchingService.name, this.sendMatchNotifications.name, "Exiting");
        }
    }
}
