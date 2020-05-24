import { IsNotEmpty, IsString } from "class-validator";

export class DeclineMatch {
    
    
    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    matchId: string;
}
