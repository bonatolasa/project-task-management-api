import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query, 
  Req
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { SingleUserResponseDto, UserListResponseDto } from '../responses/users.response';
import { CreateUserDto, UpdateUserDto} from '../dtos/users.dto';
import { User } from '../schemas/users.schemas';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUsers(@Body() createUserDto: CreateUserDto): Promise<SingleUserResponseDto> {
    const user = await this.usersService.createUsers(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  @Get()
  async getAllUsers(): Promise<UserListResponseDto> {
    const users = await this.usersService.getAllUsers();
    return {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<SingleUserResponseDto> {
    const user = await this.usersService.getUserById(id);
    return {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<SingleUserResponseDto> {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  async removeUser(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    return await this.usersService.removeUser(id);
  }

  @Get('role/:role')
  async getUsersByRole(@Param('role') role: string): Promise<UserListResponseDto> {
    const users = await this.usersService.getUsersByRole(role);
    return {
      success: true,
      data: users,
      message: 'Users retrieved by role',
    };
  }

  @Get('team/:teamId')
  async getUsersByTeam(@Param('teamId') teamId: string): Promise<UserListResponseDto> {
    const users = await this.usersService.getUsersByTeam(teamId);
    return {
      success: true,
      data: users,
      message: 'Users retrieved by team',
    };
  }
}