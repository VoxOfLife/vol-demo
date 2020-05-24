import { FieldSet } from "airtable";

export interface ScheduleFieldData extends FieldSet {
    Matches: string[];
    Status: string;
    Day: string;
    vollink: string;
    vollcall: string;
    has_confirmed: string[];
}
