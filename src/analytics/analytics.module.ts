import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsFrontendController } from './analytics-frontend.controller';
import { UserActionLog } from './entities/user-action-log.model';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, SequelizeModule.forFeature([UserActionLog])],
  controllers: [AnalyticsController, AnalyticsFrontendController],
  providers: [AnalyticsService],
  exports: [AnalyticsService, SequelizeModule],
})
export class AnalyticsModule {}
