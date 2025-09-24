import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FeedbackEntry } from './entities/feedback.model';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([FeedbackEntry]), AuthModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService, SequelizeModule],
})
export class FeedbackModule {}
