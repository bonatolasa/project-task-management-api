import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    message: string;

    @IsMongoId()
    @IsOptional()
    parentCommentId?: string;
}

