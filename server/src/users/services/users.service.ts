import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/users.schemas';
import { Project } from 'src/projects/schemas/project.schema';
import { CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
import { UserResponseDto } from '../responses/users.response';
import * as bcrypt from 'bcryptjs';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  //create user with hashed password and check for duplicate email
  async createUsers(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
    });

    const savedUser = await createdUser.save();
    return this.mapToResponseDto(savedUser);
  }

  //Get all users with team name populated
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userModel.find().populate('team', 'name').exec();

    return users.map((user) => this.mapToResponseDto(user));
  }

  //Get user by Id with team name populated
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .populate('team', 'name')
      .exec();

    if (!user) {
      throw new BadRequestException(`User with ID ${id} not found`);
    }

    return this.mapToResponseDto(user);
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  //UPDATE USER SERVICES
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    //if email is being updated, check for duplication
    if (updateUserDto.email) {
      const normalizedEmail = updateUserDto.email.toLowerCase().trim();

      const existingUser = await this.userModel.findOne({
        email: normalizedEmail,
        _id: { $ne: id }, // Exclude current user from check
      });

      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      updateUserDto.email = normalizedEmail;
    }

    console.log('Updating user', { id, updateUserDto });
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
          runValidators: true,
        })
        .populate('team', 'name')
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const result = this.mapToResponseDto(updatedUser);
      console.log('User updated successfully', { userId: id });
      return result;
    } catch (err) {
      console.error('CRITICAL: Error in UsersService.updateUser', {
        id,
        updateUserDto,
        error: err,
      });
      throw err;
    }
  }

  //DELETE USER BYid
  async removeUser(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  //Get user by Role
  async getUsersByRole(role: string): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ role })
      .populate('team', 'name')
      .exec();

    return users.map((user) => this.mapToResponseDto(user));
  }

  async getUsersByTeam(teamId: string): Promise<UserResponseDto[]> {
    const users = await this.userModel.find({ team: teamId }).exec();

    return users.map((user) => this.mapToResponseDto(user));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        lastLogin: new Date(),
      })
      .exec();
  }

  async getManagerStats(): Promise<any[]> {
    const managers = await this.userModel.find({ role: Role.MANAGER }).exec();
    const stats = await Promise.all(
      managers.map(async (manager) => {
        const projectCount = await this.projectModel
          .countDocuments({ manager: manager._id })
          .exec();
        return {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          projectCount,
        };
      }),
    );
    return stats;
  }

  private mapToResponseDto(user: User): UserResponseDto {
    let teamId: string | undefined;
    if (user.team) {
      if ((user.team as any)._id) {
        teamId = (user.team as any)._id.toString();
      } else {
        teamId = user.team.toString();
      }
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      team: teamId,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
