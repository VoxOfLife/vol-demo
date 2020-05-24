import { Injectable, Inject } from '@nestjs/common';
import { ConfirmedUsersDto } from 'src/dtos/confirmed-users-dto';
import { ConfirmedParticipants } from '../../values/confirmed-participants';
import { UserObjectConverterService } from '../user-object-converter/user-object-converter.service';
import { LogService } from 'src/log/services/log/log.service';
import { User } from 'src/matching/entities/user';
import { UserDto } from 'src/dtos/user-dto';

@Injectable()
export class ConfirmedUsersObjectConverterService {

    constructor(
        @Inject(UserObjectConverterService) private userConverter: UserObjectConverterService,
        @Inject(LogService) private readonly log: LogService,
    ) {}

    public toObject(dto: ConfirmedUsersDto): ConfirmedParticipants {
        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Executing");

        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Converting first user.");
        let a: User = null;

        if (dto.a) {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "First user has confirmed.");
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Converting first user.");
            a = this.userConverter.toEntity(dto.a);
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Successfully converted first user.");
        }
        else {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "User has not confirmed.");
        }


        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Converting second user");
        let b: User = null;

        if (dto.b) {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Second user has confirmed.");
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Converting second user.");
            b = this.userConverter.toEntity(dto.b);
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Successfully converted second user.");
        }
        else {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Second user has not confirmed.");
        }

        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Convertion successful.");
        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toObject.name, "Exiting.");
        return new ConfirmedParticipants(a, b);
    }

    public toDto(object: ConfirmedParticipants): ConfirmedUsersDto {
        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Executing.");

        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Creating DTO");
        const dto = new ConfirmedUsersDto();
        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Successfully created DTO.");

        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Checking if first user can be converted.");
        let a: UserDto = null;

        if (object.a) {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "First user can be converted.");
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Converting first user.");
            a = this.userConverter.toDto(object.a);
        }
        else {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Cannot convert first user.");
        }
        dto.a = a;


        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Checking if second user can be cnverted.");
        let b: UserDto = null;

        if (object.b) {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Second User can be converted.");
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Converting second user.");
            b = this.userConverter.toDto(object.b);
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Successfully converted second user.");
        }
        else {
            this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Cannot convert second user.");
        }
        dto.b = b;

        this.log.debug(ConfirmedUsersObjectConverterService.name, this.toDto.name, "Exiting.");
        return dto;
    }
}
