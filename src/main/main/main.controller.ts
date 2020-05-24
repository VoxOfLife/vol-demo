import { Controller, Inject, Get, Redirect } from '@nestjs/common';
import { LogService } from 'src/log/services/log/log.service';

@Controller()
export class MainController {

    constructor(
        @Inject(LogService) private readonly log: LogService,
    ) {}

    @Get()
    @Redirect("http://voxoflife.com/", 302)
    async home(): Promise<void> {

    }

}
