import { FieldSet } from "airtable";

export interface CreateScheduleFieldData extends FieldSet {
    Matches: string[];
    Status: string;
    Day: string;
}
