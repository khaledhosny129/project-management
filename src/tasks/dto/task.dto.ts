// src/tasks/dto/create-task.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsNotEmpty()
  @IsEmail()
  assignedToEmail: string;
}
