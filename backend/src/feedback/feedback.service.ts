import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FeedbackEntry } from './entities/feedback.model';
import type { FeedbackContactPreference } from './feedback.types';
import type { CreationAttributes } from 'sequelize';

export interface FeedbackPayload {
  phoneNumber: string;
  message: string;
  contactPreference: FeedbackContactPreference;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectModel(FeedbackEntry)
    private readonly feedbackModel: typeof FeedbackEntry,
  ) {}

  async submitFeedback(payload: FeedbackPayload) {
    const feedback: CreationAttributes<FeedbackEntry> = {
      phoneNumber: payload.phoneNumber,
      message: payload.message,
      contactPreference: payload.contactPreference,
    };

    await this.feedbackModel.create(feedback);

    this.logger.log(
      `Отримано звернення від ${payload.phoneNumber} (${payload.contactPreference})`,
    );
  }

  async getRecentFeedback(limit = 20) {
    return this.feedbackModel.findAll({
      order: [['createdAt', 'DESC']],
      limit,
    });
  }
}
