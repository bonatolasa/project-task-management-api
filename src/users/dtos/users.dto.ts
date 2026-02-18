import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { Role } from 'src/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

@IsEmail()
@Transform(({ value }) => value.toLowerCase().trim())
email: string;

  @IsString()
  @MinLength(6)
  password: string;

@IsEnum(Role)
@IsOptional()
@Transform(({ value }) => value?.toLowerCase())
role?: Role;


  @IsMongoId()
  @IsOptional()
  team?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
