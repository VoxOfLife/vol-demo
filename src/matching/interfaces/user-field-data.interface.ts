
import {FieldSet } from "airtable";

export interface UserFieldData extends FieldSet {
    Day: string[];
    Time: string[]; 
    User: string;
    Email: string;
    Phone: string;
    Todo: string[];
    Creation_Time: string;
    Adult: boolean;
    Topic: string[];
    MatchedIn: string[];
}
