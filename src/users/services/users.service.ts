import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/users.schemas';
import { CreateUserDto, UpdateUserDto } from '../dtos/users.dto';
import { UserResponseDto } from '../responses/users.response';
import bcrypt from 'node_modules/bcryptjs';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  //create user with hashed password and check for duplicate email
  async createUsers(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ 
      email: createUserDto.email.toLowerCase() 
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
    const users = await this.userModel
      .find()
      .populate('team', 'name')
      .exec();
    
    return users.map(user => this.mapToResponseDto(user));
  }

  //Get user by Id with team name populated
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .populate('team', 'name')
      .exec();
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.mapToResponseDto(user);
  }

    async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

//UPDATE USER SERVICES
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    //if email is being updated, check for duplication
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({   
        email: updateUserDto.email.toLowerCase(),
        _id: { $ne: id } // Exclude current user from check
      });
    
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id, 
        updateUserDto, 
        { new: true, runValidators: true }
      )
      .populate('team', 'name')
      .exec();
    
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return this.mapToResponseDto(updatedUser);
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
    
    return users.map(user => this.mapToResponseDto(user));
  }

  async getUsersByTeam(teamId: string): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ team: teamId })
      .exec();
    
    return users.map(user => this.mapToResponseDto(user));
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
    }).exec();
  }

  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      team: user.team ? (user.team as any)._id?.toString() : undefined,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}