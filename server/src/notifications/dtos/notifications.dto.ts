import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
    @IsMongoId()
    userId: string;

    @IsString()
    message: string;

    @IsString()
    type: string;

    @IsString()
    @IsOptional()
    relatedId?: string;

    @IsBoolean()
    @IsOptional()
    readStatus?: boolean;
}

