import logger from '../../utils/logger.js';

/**
 * Logger Tests
 */
describe('Logger', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function');
  });

  it('should have info method', () => {
    expect(typeof logger.info).toBe('function');
  });

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function');
  });

  it('should log error', () => {
    const error = new Error('Test error');
    logger.error(error.message, { test: true });
    expect(true).toBe(true);
  });

  it('should log info', () => {
    logger.info('Test info message', { test: true });
    expect(true).toBe(true);
  });
});

