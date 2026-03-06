import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { TasksModule } from 'src/tasks/tasks.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ActivitiesModule } from 'src/activities/activities.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        TasksModule,
        NotificationsModule,
        ActivitiesModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule { }

