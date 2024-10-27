// src/tasks/task.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private projectService: ProjectsService,
    private usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description, projectName, assignedToEmail } = createTaskDto;

    // Validate the project
    const project = await this.projectService.findProjectByName(projectName);
    if (!project) {
      throw new NotFoundException(`Project with name ${projectName} not found`);
    }

    // Validate the assigned user by email
    const assignedTo = await this.usersService.getUserByEmail(assignedToEmail);
    if (!assignedTo) {
      throw new NotFoundException(
        `User with email ${assignedToEmail} not found`,
      );
    }

    // Check if the assigned user is part of the project's members
    const isMemberInProject = project.members.some(
      (member) => member.id === assignedTo.id,
    );
    if (!isMemberInProject) {
      throw new BadRequestException(
        `User with email ${assignedToEmail} is not a member of the project "${projectName}"`,
      );
    }

    // Create the task and assign it to the specified project and user
    const task = this.taskRepository.create({
      title,
      description,
      project,
      assignedTo,
    });

    return await this.taskRepository.save(task);
  }

  async findAll(): Promise<Task[]> {
    return await this.taskRepository.find({
      relations: ['project', 'assignedTo'],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findTasksByMember(memberId: number): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: { assignedTo: { id: memberId } },
      relations: ['project'], // Include related project if needed
    });

    if (!tasks.length) {
      throw new NotFoundException(
        `No tasks found for member with ID ${memberId}`,
      );
    }

    return tasks;
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id); // Ensure task exists
    await this.taskRepository.remove(task);
  }
}
