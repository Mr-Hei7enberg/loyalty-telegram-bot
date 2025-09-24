import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { UserActionLog } from './entities/user-action-log.model';

@Module({
  imports: [SequelizeModule.forFeature([UserActionLog])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService, SequelizeModule],
})
export class AnalyticsModule {}
