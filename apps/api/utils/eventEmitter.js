import { EventEmitter } from 'events';

/**
 * Global Event Emitter
 * Used for internal application events (order notifications, status changes, etc.)
 */
class AppEventEmitter extends EventEmitter {
  constructor() {
    super();

    // Increase max listeners to prevent memory leak warnings
    this.setMaxListeners(20);
  }
}

// Export singleton instance
const eventEmitter = new AppEventEmitter();

export default eventEmitter;
