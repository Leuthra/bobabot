import { EventEmitter } from 'node:events';

class EventBus extends EventEmitter {
  /** @param {string} event @param {...any} args */
  emit(event, ...args) {
    return super.emit(event, ...args);
  }
}

const eventBus = new EventBus();
eventBus.setMaxListeners(50);

export default eventBus;
