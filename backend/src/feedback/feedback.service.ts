import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FeedbackEntry } from './entities/feedback.model';
import { FeedbackContactPreference } from './feedback.types';

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
    await this.feedbackModel.create({
      phoneNumber: payload.phoneNumber,
      message: payload.message,
      contactPreference: payload.contactPreference,
    });

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
