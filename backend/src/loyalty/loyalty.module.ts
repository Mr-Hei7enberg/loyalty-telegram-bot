import { Module } from '@nestjs/common';
import { LoyaltyController } from './controllers/loyalty.controller';
import { LoyaltyContentService } from './services/loyalty-content.service';
import { DynamicCodeService } from './services/dynamic-code.service';
import { FeedbackService } from './services/feedback.service';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyContentService, DynamicCodeService, FeedbackService],
  exports: [LoyaltyContentService, DynamicCodeService, FeedbackService],
})
export class LoyaltyModule {}
