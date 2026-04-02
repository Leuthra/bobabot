import { describe, it, expect } from 'vitest';
import eventBus from '../src/core/eventBus.js';

describe('eventBus', () => {
  it('emits and receives events', () => {
    let received = null;

    eventBus.on('test.event', (data) => {
      received = data;
    });

    eventBus.emit('test.event', { hello: 'world' });
    expect(received).toEqual({ hello: 'world' });

    eventBus.removeAllListeners('test.event');
  });

  it('supports multiple listeners', () => {
    let count = 0;
    const inc = () => count++;

    eventBus.on('test.multi', inc);
    eventBus.on('test.multi', inc);
    eventBus.emit('test.multi');

    expect(count).toBe(2);
    eventBus.removeAllListeners('test.multi');
  });
});
