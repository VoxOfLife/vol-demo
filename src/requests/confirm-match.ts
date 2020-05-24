import { Transform } from "class-transformer"
import { IsNotEmpty, IsString } from "class-validator"

export class ConfirmMatch {

    @IsNotEmpty()
    @IsString()
    matchId: string;

    @IsNotEmpty()
    @IsString()
    userId: string;
}

