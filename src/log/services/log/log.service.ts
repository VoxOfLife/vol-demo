import { Injectable, Logger, Inject } from '@nestjs/common';

@Injectable()
export class LogService {

    constructor(@Inject(Logger) private logger: Logger) {}

    debug(className: string, methodName: string, message: string): void {
        this.logger.debug(message, this.formatContext(className, methodName));
    }

    warn(className: string, methhodName: string, message: any): void {
        this.logger.warn(message, this.formatContext(className, methhodName));
    }

    error(className: string, methodName: string, message: any, trace?: string): void {
        this.logger.error(message, trace, this.formatContext(className, methodName));
    }

    verbose(className: string, methodName: string, message: any): void {
        this.logger.verbose(message, this.formatContext(className, methodName));
    }

    log(className: string, methodName: string, message: any): void {
        this.logger.log(message, this.formatContext(className, methodName));
    }

    private formatContext(className: string, methodName: string): string {
        return className + "." + methodName;
    }
}
