import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entites/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [ProjectsService],
  controllers: [ProjectsController],
  imports: [forwardRef(() => UsersModule), TypeOrmModule.forFeature([Project])],
  exports: [ProjectsService],
})
export class ProjectsModule {}
