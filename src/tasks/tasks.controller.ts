// src/tasks/task.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/task.dto';
import { Task } from './entities/task.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'project_manager', 'team_lead')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Create a new task
  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.create(createTaskDto);
  }

  // Get all tasks
  @Get()
  async getAllTasks(): Promise<Task[]> {
    return await this.tasksService.findAll();
  }

  // Get a specific task by ID
  @Get(':id')
  async getTaskById(@Param('id') id: number): Promise<Task> {
    return await this.tasksService.findOne(id);
  }

  // Delete a task by ID
  @Delete(':id')
  async deleteTask(@Param('id') id: number): Promise<void> {
    return await this.tasksService.remove(id);
  }
}
