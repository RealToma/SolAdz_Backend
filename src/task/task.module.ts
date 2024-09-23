import { forwardRef, Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [TaskService],
  imports: [
    ScheduleModule.forRoot(),
    forwardRef(() => UsersModule)
  ]
})
export class TaskModule {}
