import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { TasksController } from './controllers/tasks.controller';
import { TasksService } from './services/tasks.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ProjectsModule } from '../projects/projects.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
    ]),
    NotificationsModule,
    ProjectsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
