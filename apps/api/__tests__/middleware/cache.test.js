import { cache, invalidateCache } from '../../middleware/cache.js';

/**
 * Cache Middleware Tests
 */
describe('Cache Middleware', () => {
  it('should export cache function', () => {
    expect(typeof cache).toBe('function');
  });

  it('should export invalidateCache function', () => {
    expect(typeof invalidateCache).toBe('function');
  });

  it('should create cache middleware with duration', () => {
    const middleware = cache(300);
    expect(typeof middleware).toBe('function');
  });

  it('should create invalidate cache middleware with pattern', () => {
    const middleware = invalidateCache('products:*');
    expect(typeof middleware).toBe('function');
  });
});

