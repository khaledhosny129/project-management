// src/projects/dto/create-project.dto.ts
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEmail()
  teamLeadEmail: string;

  @IsArray()
  @IsEmail({}, { each: true })
  memberEmails: string[];
}
