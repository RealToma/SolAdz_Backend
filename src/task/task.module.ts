import { Module } from '@nestjs/common';
import { TaskService } from './task.service';

@Module({
  providers: [TaskService],
  imports: [
    
  ]
})
export class TaskModule {}
