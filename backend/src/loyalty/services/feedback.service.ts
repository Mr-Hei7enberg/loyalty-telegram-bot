import { Injectable, Logger } from '@nestjs/common';
import type { FeedbackPayload } from '../interfaces/loyalty.interface';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  submitFeedback(payload: FeedbackPayload): Promise<void> {
    this.logger.log(
      `Feedback received from ${payload.phoneNumber} (${payload.contactPreference}): ${payload.message}`,
    );

    // TODO: додати інтеграцію з зовнішнім API або email-сервісом
    return Promise.resolve();
  }
}
