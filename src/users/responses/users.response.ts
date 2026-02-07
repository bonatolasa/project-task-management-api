export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  team?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserListResponseDto {
  success: boolean;
  data: UserResponseDto[];
  message: string;
}

export class SingleUserResponseDto {
  success: boolean;
  data: UserResponseDto;
  message: string;
}