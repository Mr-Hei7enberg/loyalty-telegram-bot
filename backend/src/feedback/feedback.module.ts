import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeedbackEntry } from './entities/feedback.model';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';

@Module({
  imports: [SequelizeModule.forFeature([FeedbackEntry])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService, SequelizeModule],
})
export class FeedbackModule {}
