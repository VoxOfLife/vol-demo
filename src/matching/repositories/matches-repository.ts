import Airtable, { Base, Table, Record, Records } from "airtable";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LogService } from "src/log/services/log/log.service";
import { ScheduleFieldData } from "../interfaces/schedule-field-data.interface";
import { Match } from "../entities/match";
import { MatchSchedule } from "../values/match-schedule";
import { User } from "../entities/user";
import { UsersRepository } from "./users-repository";
import { MatchFactory } from "../factories/match-factory";
import { CreateScheduleFieldData } from "../interfaces/create-schedule-field-data.interface";


@Injectable()
export class MatchesRepository {

    private readonly apiKey: string;
    private readonly baseId: string;
    private readonly base: Base;


    constructor(
        @Inject(ConfigService) config: ConfigService,
        @Inject(LogService) private readonly log: LogService,
        @Inject(UsersRepository) private readonly userRepo: UsersRepository,
        @Inject(MatchFactory) private readonly matchFactory: MatchFactory
    ) {
        this.apiKey = config.get('airtable.apiKey');
        this.baseId = config.get("airtable.baseId");

        try {
            this.base = new Airtable({ apiKey: this.apiKey }).base(this.baseId);
        }
        catch (err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, "constructor", error.message, error.stack);
        }
    }

    /**
     * Creates a new Match
     * @param user1 User
     * @param user2 User
     * @param schedule MatchSchedule
     */

    async create(user1: User, user2: User, schedule: MatchSchedule): Promise<Match> {

        this.log.debug(MatchesRepository.name, this.create.name, "Executing.");
        let match: Match;

        try {
            // get the table
            this.log.debug(MatchesRepository.name, this.create.name, "Getting table.");
            const scheduleTable: Table<CreateScheduleFieldData> = this.base("Schedule") as Table<CreateScheduleFieldData>
            this.log.debug(MatchesRepository.name, this.create.name, "Successfully got table.");


            // update the data
            this.log.debug(MatchesRepository.name, this.create.name, "Extracting data.");
            const data: CreateScheduleFieldData = {
                Matches: [user1.id.value, user2.id.value],
                Status: "Pending",
                Day: schedule.value.toISOString()
            };
            this.log.debug(MatchesRepository.name, this.create.name, "Successfully extracted data.");

            this.log.debug(MatchesRepository.name, this.create.name, "Creating match");
            const record: Record<ScheduleFieldData> = await scheduleTable.create(data) as Record<ScheduleFieldData>;
            this.log.debug(MatchesRepository.name, this.create.name, "Successfully created match");


            // create the match object.
            this.log.debug(MatchesRepository.name, this.create.name, "Generating match entity");

            this.log.debug(MatchesRepository.name, this.create.name, "Getting user 1 for match.");
            const u1: User = await this.userRepo.findById(record.fields.Matches[0]);

            this.log.debug(MatchesRepository.name, this.create.name, "Getting user 2 for match");
            const u2: User = await this.userRepo.findById(record.fields.Matches[1]);

            const confirmedUsers = this.getConfirmedUsers(u1, u2, record.fields.has_confirmed);
            const cuCount = confirmedUsers.length;
            const confirmedUserA = (cuCount > 0) ? confirmedUsers[0] : null;
            const confirmedUserB = (cuCount == 2) ? confirmedUsers[1] : null;

            this.log.debug(MatchesRepository.name, this.create.name, "Creating match object.");
            match = this.matchFactory.fromRaw(record.id, u1, u2, new Date(record.fields.Day), record.fields.Status, record.fields.vollink, record.fields.vollcall, confirmedUserA, confirmedUserB);
            this.log.debug(MatchesRepository.name, this.create.name, "Successfuly created match object.");


        }
        catch (err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.create.name, error.message, error.stack);
        }

        this.log.debug(MatchesRepository.name, this.create.name, "Exiting successfully.");
        return match;
    }

    /**
     * finds a match given a match id.
     * @param id the id of the match to be retrieved.
     */

    public async findById(id: string): Promise<Match> {

        this.log.debug(MatchesRepository.name, this.findById.name, "Executing");
        let match: Match = null;


        try {
            // get the table
            this.log.debug(MatchesRepository.name, this.findById.name, "Getting table");
            const scheduleTable: Table<ScheduleFieldData> = this.base("Schedule") as Table<ScheduleFieldData>;

            // search the table for the user.
            this.log.debug(MatchesRepository.name, this.findById.name, `Searching for match with id: ${id}`);
            const record: Record<ScheduleFieldData> = await scheduleTable.find(id);

            if (record) {
                // record was found
                this.log.debug(MatchesRepository.name, this.findById.name, `Found match with id: ${record.id}`);

                // convert record to Match object.
                this.log.debug(MatchesRepository.name, this.findById.name, "Converting to Match entity.");
                const u1 = await this.userRepo.findById(record.fields.Matches[0]);
                const u2 = await this.userRepo.findById(record.fields.Matches[1]);
                const confirmedUsers = this.getConfirmedUsers(u1, u2, record.fields.has_confirmed);
                const cuCount = confirmedUsers.length;
                const confirmedUserA = (cuCount > 0) ? confirmedUsers[0] : null;
                const confirmedUserB = (cuCount == 2) ? confirmedUsers[1] : null;
                match = this.matchFactory.fromRaw(record.id, u1, u2, new Date(record.fields.Day), record.fields.Status, record.fields.vollink, record.fields.vollcall, confirmedUserA, confirmedUserB);
            }
            else {
                // record not found.
                this.log.debug(MatchesRepository.name, this.findById.name, `Could not find match with id: ${id}`);
            }
        }
        catch(err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.findById.name, error.message, error.stack);
        }

        this.log.debug(MatchesRepository.name, this.findById.name, "Exiting");
        return match;
    }

    /**
     * Saves changes made to a match.
     * @param match The match to be saved.
     */

    public async save(match: Match): Promise<Match> {
        this.log.debug(MatchesRepository.name, this.save.name, "Executing");
        let savedMatch: Match = null; 

        try {
            this.log.debug(MatchesRepository.name, this.save.name, "Getting table");
            const scheduleTable: Table<ScheduleFieldData> = this.base("Schedule") as Table<ScheduleFieldData>;
            this.log.debug(MatchesRepository.name, this.save.name, "Successfully got table.");

            // update the table. 

            const id = match.id.value;
            const matches = [
                match.participants.a.id.value,
                match.participants.b.id.value
            ];
            const status = match.status.value;

            const confirmedParticipants: string[] = [];
            if (match.confirmedParticipants.a) {
                confirmedParticipants.push(match.confirmedParticipants.a.id.value);
            }

            if (match.confirmedParticipants.b) {
                confirmedParticipants.push(match.confirmedParticipants.b.id.value);
            }

            const updatedRecord: Record<ScheduleFieldData> = await scheduleTable.update([
                {
                    id: id,
                    fields: {
                        Matches: matches,
                        Status: status,
                        has_confirmed: confirmedParticipants
                    }
                }
            ]) as Record<ScheduleFieldData>;

            // create the match object.
            this.log.debug(MatchesRepository.name, this.create.name, "Generating Match entity.");
            this.log.debug(MatchesRepository.name, this.create.name, "Getting match participant data.");
            const u1 = await this.userRepo.findById(updatedRecord.fields.Matches[0]);
            const u2 = await this.userRepo.findById(updatedRecord.fields.Matches[1]);

            this.log.debug(MatchesRepository.name, this.create.name, "Getting confirmed users.");
            const confirmedUsers = this.getConfirmedUsers(u1, u2, updatedRecord.fields.has_confirmed);
            const cuCount = confirmedUsers.length;
            const confirmedUserA = (cuCount > 0) ? confirmedUsers[0] : null;
            const confirmedUserB = (cuCount == 2) ? confirmedUsers[1] : null;

            savedMatch = this.matchFactory.fromRaw(updatedRecord.id, u1, u2, new Date(updatedRecord.fields.Day), updatedRecord.fields.Status, updatedRecord.fields.vollink, updatedRecord.fields.vollcall, confirmedUserA, confirmedUserB);
            this.log.debug(MatchesRepository.name, this.save.name, "Successfully created Match entity");
        }
        catch(err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.save.name, error.message, error.stack);
        }

        this.log.debug(MatchesRepository.name, this.save.name, "Exiting Successfully.");
        return savedMatch;
    }

    /**
     * gets pending matches.
     */

    public async getPendingMatches(): Promise<Match[]> {
        this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "Executing");
        const matches: Match[] = [];
        try {
            // get the table
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "getting table.");
            const scheduleTable: Table<ScheduleFieldData> = this.base("Schedule") as Table<ScheduleFieldData>;
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "successfully retrieved table.");

            // get the records.
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "Retrieving records.");
            const records: Records<ScheduleFieldData> = await scheduleTable.select({
                fields: ["Matches", "Day", "has_confirmed", "Status", "vollink", "vollcall"],
                filterByFormula: '{Status} = "Pending"',
            }).all();

            // convert each record to a match.
            records.forEach(async (record) => {
                const fields = record.fields;
                const u1 = await this.userRepo.findById(fields.Matches[0]);
                const u2 = await this.userRepo.findById(fields.Matches[1]);
                const confirmedUsers = this.getConfirmedUsers(u1, u2, fields.has_confirmed);
                const match = this.matchFactory.fromRaw(record.id, u1, u2, new Date(fields.Day), fields.Status, fields.vollink, fields.vollcall, confirmedUsers[0], confirmedUsers[1]);
                matches.push(match);
            });
        }
        catch(err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.getPendingMatches.name, error.message, error.stack);
        }

        return matches;
    }

    /**
     * Get matches that are ongoing.
     */

    public async getOngoingMatches(): Promise<Match[]> {
        this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "Executing");
        const matches: Match[] = [];
        try {
            // get the table
            this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "getting table.");
            const scheduleTable: Table<ScheduleFieldData> = this.base("Schedule") as Table<ScheduleFieldData>;
            this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "successfully retrieved table.");

            // get the records.
            this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Retrieving records.");
            const records: Records<ScheduleFieldData> = await scheduleTable.select({
                fields: ["Matches", "Day", "has_confirmed", "Status", "vollink", "vollcall"],
                filterByFormula: 'AND({Status} = "Pending", IS_AFTER(TODAY(), {Day}))',
            }).all();
            this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Successfully retrieved records.");

            // convert each record to a match.
            this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Converting records to objects.");
            records.forEach(async (record) => {
                const fields = record.fields;
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, `Getting participant ${fields.Matches[0]} for match ${record.id}`);
                const u1 = await this.userRepo.findById(fields.Matches[0]);
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, `Successfully retrieved participant ${fields.Matches[0]} for match ${record.id}`);

                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, `Getting participant ${fields.Matches[1]} for match ${record.id}`);
                const u2 = await this.userRepo.findById(fields.Matches[1]);
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, `Successfully retrieved participant ${fields.Matches[1]} for match ${record.id}`);

                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Getting confirmed users for match: " + record.id);
                const confirmedUsers = this.getConfirmedUsers(u1, u2, fields.has_confirmed);
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Successfully got confirmed users for match: " + record.id);
                
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Creating match object");
                const match = this.matchFactory.fromRaw(record.id, u1, u2, new Date(fields.Day), fields.Status, fields.vollink, fields.vollcall, confirmedUsers[0], confirmedUsers[1]);
                matches.push(match);
                this.log.debug(MatchesRepository.name, this.getOngoingMatches.name, "Successfully created match object");
            });
        }
        catch (err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.getOngoingMatches.name, error.message, error.stack);
        }

        return matches;
    }

    /**
     * Retrieves the unconfirmed matches scheduled for the current date.
     */

    public async getPendingMatchesForToday(): Promise<Match[]> {
        this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "Executing");
        const matches: Match[] = [];

        try {
            // get the table
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "getting table.");
            const scheduleTable: Table<ScheduleFieldData> = this.base("Schedule") as Table<ScheduleFieldData>;
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "successfully retrieved table.");

            // get the records.
            this.log.debug(MatchesRepository.name, this.getPendingMatches.name, "Retrieving records.");
            const records: Records<ScheduleFieldData> = await scheduleTable.select({
                fields: ["Matches", "Day", "has_confirmed", "Status", "vollink", "vollcall"],
                filterByFormula: 'AND({Status} = "Pending", IS_SAME({Day}, TODAY(), "day"))',
            }).all();

            // convert each record to a match.
            records.forEach(async (record) => {
                const fields = record.fields;
                const u1 = await this.userRepo.findById(fields.Matches[0]);
                const u2 = await this.userRepo.findById(fields.Matches[1]);
                const confirmedUsers = this.getConfirmedUsers(u1, u2, fields.has_confirmed);
                const match = this.matchFactory.fromRaw(record.id, u1, u2, new Date(fields.Day), fields.Status, fields.vollink, fields.vollcall, confirmedUsers[0], confirmedUsers[1]);
                matches.push(match);
            });
        }
        catch (err) {
            const error = err as Error;
            this.log.error(MatchesRepository.name, this.getPendingMatches.name, error.message, error.stack);
        }

        return matches;
    }



    // HELPERS


    /**
     * 
     * @param u1 
     * @param u2 
     * @param confirmedIds 
     */

    private getConfirmedUsers(u1: User, u2: User, confirmedIds: string[]): User[] {
        const confirmedUsers: User[] = [];
        const confirmedUsersCount = (confirmedIds) ? confirmedIds.length : 0;

        if (confirmedUsersCount == 1) {

            if (u1.equals(confirmedIds[0])) {
                confirmedUsers.push(new User(u1.id, u1.name, u1.isAdult, u1.email, u1.phone, u1.availabilities, u1.topics, u1.lastScheduledMatch, u1.creation));
            }
            else if (u2.equals(confirmedIds[0])) {
                confirmedUsers.push(new User(u2.id, u2.name, u2.isAdult, u2.email, u2.phone, u2.availabilities, u2.topics, u2.lastScheduledMatch, u2.creation));
            }
        }
        else if (confirmedUsersCount == 2) {
            confirmedUsers.push(new User(u1.id, u1.name, u1.isAdult, u1.email, u1.phone, u1.availabilities, u1.topics, u1.lastScheduledMatch, u1.creation));
            confirmedUsers.push(new User(u2.id, u2.name, u2.isAdult, u2.email, u2.phone, u2.availabilities, u2.topics, u2.lastScheduledMatch, u2.creation));
        }

        return confirmedUsers;
    }

}
