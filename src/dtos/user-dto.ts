export class UserDto {
    id: string;
    name: string;
    phone: string;
    availabilities: Date[];
    topics: string[];
    isAdult: boolean;
    email: string;
    lastMatch: string;
    created_at: Date;
}
