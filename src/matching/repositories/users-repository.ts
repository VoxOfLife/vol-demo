
import { User } from "../entities/user";
import { ConfigService } from "@nestjs/config";
import { Inject, Injectable } from "@nestjs/common";
import { LogService } from "src/log/services/log/log.service";
import Airtable, { Base, Records, Table, Record } from "airtable";
import { UserFieldData } from "../interfaces/user-field-data.interface";
import { UserFactory } from "../factories/user-factory";
import { AvailabilityBlockService } from "../services/availability-block/availability-block.service";



@Injectable()
export class UsersRepository {
    private readonly apiKey: string;
    private readonly baseId: string;
    private readonly base: Base;

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        @Inject(LogService) private readonly log: LogService,
        @Inject(UserFactory) private readonly userFactory: UserFactory,
        @Inject(AvailabilityBlockService) private readonly availabilityBlockService: AvailabilityBlockService,
    ) {
        this.apiKey = this.config.get<string>('airtable.apiKey');
        this.baseId = this.config.get<string>('airtable.baseId');

        try {
            this.base = new Airtable({ apiKey: this.apiKey }).base(this.baseId);
        }
        catch(err) {
            const error = err as Error;
            this.log.error(UsersRepository.name, "constructor", error.message, error.stack);
        }
    }

    /**
     * Gets the unmatched users
     */
    async getUnmatchedUsers(): Promise<User[]> {

        this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Executing");

        const users: User[] = [];
        try {
            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Getting base from AirTable.");
            // get the base

            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Successfully got base.");
            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Getting unmatched users from Voxer table.");

            // get the records for unmatched voxers.
            const usersTable: Table<UserFieldData> = this.base("Onboarding") as Table<UserFieldData>;
            const records: Records<UserFieldData> = await usersTable.select({
                fields: ['User', 'Phone', "Day", 'Time', 'Email', 'Created Time', 'Todo', 'Adult', 'Topic', "MatchedIn"], // need to change Creation Time field name
                filterByFormula: '{Matched Total} = 0',
            }).all();

            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Successfully retrieved records.");

            // convert them to user objects.
            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Converting Records to User entities.");
            records.forEach(async (record) => {
                // get the fields
                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Getting fields for user record: " + record.id);
                const fields = record.fields;

                // get last match
                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Getting last match for user: " + record.id);
                const lastMatch: string = (fields.MatchedIn) ? fields.MatchedIn[0] : null;
                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Successfully retrieved last match for user: " + record.id);

                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Creating User entity for user: " + record.id);
                const avaialbilities = this.availabilityBlockService.createManyFromDaysAndTimesList(fields.Day, fields.Time);
                const user = this.userFactory.fromRaw(record.id, fields.User, fields.Adult, fields.Email, fields.Phone, avaialbilities, fields.Topic, lastMatch, new Date(fields.Creation_Time));
                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Adding user " + record.id + "to the users list.");
                users.push(user);
                this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Successfully converted user: " + record.id);
            });
            this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Successfully obtained unmatched users.");
        }
        catch (err) {
            const error = err as Error;
            this.log.error(UsersRepository.name, this.getUnmatchedUsers.name, error.message, error.stack);
        }

        this.log.debug(UsersRepository.name, this.getUnmatchedUsers.name, "Exiting successfully.");

        return users;
    }

    public async findById(id: string): Promise<User> {
        this.log.debug(UsersRepository.name, this.findById.name, "Executing");
        let user: User;

        try {
            // get the table
            this.log.debug(UsersRepository.name, this.findById.name, "Getting table");
            const userTable: Table<UserFieldData> = this.base('Onboarding') as Table<UserFieldData>;

            // search the records
            this.log.debug(UsersRepository.name, this.findById.name, `Searching for user with id: ${id}`);
            const record: Record<UserFieldData> = await userTable.find(id);

            if (record) {
                // user is found.
                this.log.debug(UsersRepository.name, this.findById.name, `Successfully found user with id: ${id}`);

                // convert the record to a user object. 
                this.log.debug(UsersRepository.name, this.findById.name, "Getting last match for user: " + record.id);
                const fields: UserFieldData = record.fields;
                const lastMatch: string = (record.fields.MatchedIn) ? record.fields.MatchedIn[0] : null;
                const avaialbilities = this.availabilityBlockService.createManyFromDaysAndTimesList(fields.Day, fields.Time);
                user = this.userFactory.fromRaw(record.id, fields.User, fields.Adult, fields.Email, fields.Phone, avaialbilities, fields.Topic, lastMatch, new Date(fields.Creation_Time));
            }
            else {
                // user not found.
                this.log.debug(UsersRepository.name, this.findById.name, `Could not find user with id: ${id}`);
            }
        }
        catch (err) {
            const error = err as Error;
            this.log.error(UsersRepository.name, this.findById.name, error.message, error.stack);
        }

        this.log.debug(UsersRepository.name, this.findById.name, "Exiting.");
        return user;
    }
}
