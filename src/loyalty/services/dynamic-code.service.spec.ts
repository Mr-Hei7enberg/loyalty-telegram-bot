import { DynamicCodeService } from './dynamic-code.service';

describe('DynamicCodeService', () => {
  const redisService = {
    set: jest.fn(),
    get: jest.fn(),
  } as unknown as any;

  describe('formatExpiry', () => {
    it('повертає час у часовому поясі Europe/Kyiv', () => {
      const service = new DynamicCodeService(redisService);
      const timestamp = Date.UTC(2024, 5, 1, 10, 30); // 13:30 за Києвом у червні

      const result = service.formatExpiry(timestamp);
      const expected = new Intl.DateTimeFormat('uk-UA', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Kyiv',
      }).format(timestamp);

      expect(result).toBe(expected);
    });
  });
});
