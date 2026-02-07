import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { Role } from '../../enums/role.enum';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
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
