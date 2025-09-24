import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserActionLog } from './entities/user-action-log.model';

export interface AnalyticsEventPayload {
  userId?: number;
  phoneNumber?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectModel(UserActionLog)
    private readonly logModel: typeof UserActionLog,
  ) {}

  async record(action: string, payload: AnalyticsEventPayload = {}) {
    await this.logModel.create({
      action,
      userId: payload.userId ?? null,
      phoneNumber: payload.phoneNumber ?? null,
      metadata: payload.metadata ?? null,
    });

    this.logger.debug(`Зафіксовано подію ${action}`);
  }

  async getUsageSummary() {
    const sequelize = this.logModel.sequelize as Sequelize | undefined;

    if (!sequelize) {
      return { total: 0, actions: [] };
    }

    const rows = await this.logModel.findAll<{
      action: string;
      count: unknown;
    }>({
      attributes: [
        'action',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['action'],
      raw: true,
    });

    const actions = rows.map((row) => ({
      action: row.action,
      count: Number(row.count ?? 0),
    }));

    const total = actions.reduce((sum, item) => sum + item.count, 0);

    return { total, actions };
  }
}
