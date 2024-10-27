// src/projects/project.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { Project } from './entites/project.entity';
import { CreateProjectDto } from './dto/project.dto';
import { UserRoles } from '../users/enums/user.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    private usersService: UsersService, // Inject UsersService
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const { name, description, teamLeadEmail, memberEmails } = createProjectDto;

    // Fetch and validate the team lead by email
    const teamLead = await this.usersService.getUserByEmail(teamLeadEmail);
    if (!teamLead) {
      throw new NotFoundException(
        `Team lead with email ${teamLeadEmail} not found`,
      );
    }

    // Check team lead's role
    if (
      ![UserRoles.PROJECT_MANAGER, UserRoles.TEAM_LEAD].includes(teamLead.role)
    ) {
      throw new BadRequestException(
        `User with email ${teamLeadEmail} does not have permission to be a team lead`,
      );
    }

    // Fetch members by email
    const members = await this.usersService.getUsersByEmails(memberEmails);
    if (members.length !== memberEmails.length) {
      const missingEmails = memberEmails.filter(
        (email) => !members.some((member) => member.email === email),
      );
      throw new NotFoundException(
        `Members with emails [${missingEmails.join(', ')}] not found`,
      );
    }

    // Create the new project and assign the team lead and members
    const project = this.projectRepository.create({
      name,
      description,
      teamLead,
      members,
    });

    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return await this.projectRepository.find({
      relations: ['teamLead', 'members', 'tasks'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['teamLead', 'members', 'tasks'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async findProjectsByTeamLead(teamLeadId: number): Promise<Project[]> {
    const projects = await this.projectRepository.find({
      where: { teamLead: { id: teamLeadId } },
      relations: ['members', 'tasks'], // Include related members and tasks if needed
    });

    if (!projects.length) {
      throw new NotFoundException(
        `No projects found for team lead with ID ${teamLeadId}`,
      );
    }

    return projects;
  }

  async findProjectByName(name: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { name },
      relations: ['teamLead', 'members', 'tasks'],
    });
    if (!project) {
      throw new NotFoundException(`Project with name "${name}" not found`);
    }
    return project;
  }

  async remove(id: number): Promise<void> {
    const project = await this.findOne(id); // Ensure project exists
    await this.projectRepository.remove(project);
  }
}
