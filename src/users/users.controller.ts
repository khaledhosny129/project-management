// src/users/users.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRegisterRequestDto } from './dto/user-register.req.dto';
import { User } from './entities/user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRoles } from './enums/user.enum';
import { TasksService } from '../tasks/tasks.service';
import { ProjectsService } from '../projects/projects.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post('/create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // Require admin role for all routes
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('/register')
  @UsePipes(ValidationPipe)
  async doUserRegistration(
    @Body()
    userRegister: UserRegisterRequestDto,
  ): Promise<User> {
    return await this.usersService.doUserRegistration(userRegister);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/my-tasks')
  @UseGuards(JwtAuthGuard) // Protect this route with JWT authentication
  async getMyTasks(@Req() request: Request) {
    const user = request.user as User;

    if (user.role === UserRoles.TEAM_LEAD) {
      // Fetch projects managed by the team lead
      return await this.projectsService.findProjectsByTeamLead(user.id);
    }

    if (user.role === UserRoles.MEMBER) {
      // Fetch tasks assigned to the member
      return await this.tasksService.findTasksByMember(user.id);
    }

    return { message: 'No tasks or projects found for this user' };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usersService.remove(+id);
  }
}
