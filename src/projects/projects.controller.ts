// src/projects/project.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from './entites/project.entity';
import { CreateProjectDto } from './dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectsService) {}

  // Create a new project
  @Post()
  @Roles('admin', 'project_manager')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    return await this.projectService.create(createProjectDto);
  }

  // Get all projects
  @Get()
  @Roles('admin', 'project_manager')
  async getAllProjects(): Promise<Project[]> {
    return await this.projectService.findAll();
  }

  // Get a specific project by ID
  @Get(':id')
  @Roles('admin', 'project_manager')
  async getProjectById(@Param('id') id: number): Promise<Project> {
    return await this.projectService.findOne(id);
  }

  // Delete a project by ID
  @Delete(':id')
  @Roles('admin')
  async deleteProject(@Param('id') id: number): Promise<void> {
    return await this.projectService.remove(id);
  }
}
