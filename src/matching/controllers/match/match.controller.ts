import { Controller, Inject, Post, Param, NotFoundException, ForbiddenException, Get, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { MatchingService } from 'src/matching/services/matching/matching.service';
import { User } from 'src/matching/entities/user';
import { MatchInfo } from 'src/matching/values/match-info';
import { UsersRepository } from 'src/matching/repositories/users-repository';
import { Match } from 'src/matching/entities/match';
import { NotificationService } from 'src/notifications/services/notification/notification.service';
import { MatchObjectConverterService } from 'src/matching/services/match-object-converter/match-object-converter.service';
import { ConfirmMatch } from 'src/requests/confirm-match';
import { MatchesRepository } from 'src/matching/repositories/matches-repository';
import { DeclineMatch } from 'src/requests/decline-match';
import { LogService } from 'src/log/services/log/log.service';


@Controller('match')
export class MatchController {


    constructor(
        @Inject(MatchingService) private matchService: MatchingService,
        @Inject(NotificationService) private readonly notificationService: NotificationService,
        @Inject(MatchObjectConverterService) private convert: MatchObjectConverterService,
        @Inject(MatchesRepository) private readonly matchRepository: MatchesRepository,
        @Inject(LogService) private readonly log: LogService,
    ) { }

    @Get("/:matchId/confirm/:userId")
    public async confirmMatch(@Param() params: ConfirmMatch): Promise<void> {
        this.log.debug(MatchController.name, this.confirmMatch.name, "Executing");

        // get the match given the id
        this.log.debug(MatchController.name, this.confirmMatch.name, "Getting match");
        const match: Match = await this.matchRepository.findById(params.matchId);

        if (!match) {
            // match not found
            this.log.debug(MatchController.name, this.confirmMatch.name, "Match not found");
            throw new NotFoundException();
        }

        // get the user
        this.log.debug(MatchController.name, this.confirmMatch.name, "Getting User");
        let user: User = null;

        if (match.participants.a.id.equals(params.userId)) {
            user = match.participants.a;
            this.log.debug(MatchController.name, this.confirmMatch.name, "Successfully retrieved user.");
        }
        else if (match.participants.b.id.equals(params.userId)) {
            user = match.participants.b;
            this.log.debug(MatchController.name, this.confirmMatch.name, "Successfully retrieved user.");
        }
        else {
            // user does not belong to this match.
            this.log.debug(MatchController.name, this.confirmMatch.name, "User does not belong in this match.");
            throw new UnauthorizedException();
        }

        // confirm stock.
        this.log.debug(MatchController.name, this.confirmMatch.name, "Confirming user for the match.");
        const savedMatch = await this.matchService.confirmMatch(user, match);
        this.log.debug(MatchController.name, this.confirmMatch.name, "Successfully confirmed user.");

        // check if the match is officially confirmed.
        this.log.debug(MatchController.name, this.confirmMatch.name, "Checking if match can be confirmed");
        if (savedMatch.isConfirmed()) {
            this.log.debug(MatchController.name, this.confirmMatch.name, "Match has successfully been confirmed.");

            this.log.debug(MatchController.name, this.confirmMatch.name, "Sending confirmation notifications.");
            const matchDto = this.convert.toDto(savedMatch);
            await this.notificationService.sendMatchConfirmationNotification(matchDto);
            this.log.debug(MatchController.name, this.confirmMatch.name, "Successfully sent notifications.");
        }
        else {
            this.log.debug(MatchController.name, this.confirmMatch.name, "Match pending confirmation from other participant.");
        }

        this.log.debug(MatchController.name, this.confirmMatch.name, "Exiting successfully.");
        // redirect to success page.

    }

    @Get(':matchId/decline/:userId')
    public async cancelMatch(@Param() params: DeclineMatch): Promise<void> {
        this.log.debug(MatchController.name, this.cancelMatch.name, "Executing.");

        // get the match
        this.log.debug(MatchController.name, this.cancelMatch.name, "Getting match");
        const match = await this.matchRepository.findById(params.matchId);

        if (!match) {
            this.log.debug(MatchController.name, this.cancelMatch.name, "Match not found.");
            throw new NotFoundException();
        }
        this.log.debug(MatchController.name, this.cancelMatch.name, "Successfully retrieved match.");

        // get the user
        this.log.debug(MatchController.name, this.cancelMatch.name, "Retrieving user");
        let user: User = null;

        if (match.participants.a.id.equals(params.userId)) {
            user = match.participants.a;
            this.log.debug(MatchController.name, this.cancelMatch.name, "Successfully retrieved user.");
        }
        else if (match.participants.b.id.equals(params.userId)) {
            user = match.participants.b;
            this.log.debug(MatchController.name, this.cancelMatch.name, "Successfully retrieved user.");
        }
        else {
            this.log.debug(MatchController.name, this.cancelMatch.name, "User does not belong in this match.");
            throw new UnauthorizedException();
        }

        // cancel the match.
        this.log.debug(MatchController.name, this.cancelMatch.name, "Cancelling the match,");
        const updatedMatch = await this.matchService.declineMatch(user, match);

        this.log.debug(MatchController.name, this.cancelMatch.name, "Successfully cancelled match.");
        const dto = this.convert.toDto(updatedMatch);
        await this.notificationService.sendMatchCancellationNotification(dto);
        this.log.debug(MatchController.name, this.cancelMatch.name, "Successfully sent notifications");
        this.log.debug(MatchController.name, this.cancelMatch.name, "Exiting.");

        // redirect to success page.
    }
}
