// Service Worker tests
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Service Worker (sw.js)', () => {
  let listeners;
  let mockSelf;

  beforeEach(() => {
    listeners = {};

    mockSelf = {
      addEventListener: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
      skipWaiting: jest.fn(),
      clients: {
        claim: jest.fn(() => Promise.resolve())
      }
    };
  });

  function loadSW() {
    const code = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
    const context = vm.createContext({ self: mockSelf });
    vm.runInContext(code, context);
  }

  test('registers install, activate, and fetch listeners', () => {
    loadSW();
    expect(mockSelf.addEventListener).toHaveBeenCalledWith('install', expect.any(Function));
    expect(mockSelf.addEventListener).toHaveBeenCalledWith('activate', expect.any(Function));
    expect(mockSelf.addEventListener).toHaveBeenCalledWith('fetch', expect.any(Function));
  });

  test('install handler calls skipWaiting', () => {
    loadSW();
    listeners['install']({});
    expect(mockSelf.skipWaiting).toHaveBeenCalled();
  });

  test('activate handler calls clients.claim via waitUntil', () => {
    loadSW();
    const event = {
      waitUntil: jest.fn()
    };
    listeners['activate'](event);
    expect(event.waitUntil).toHaveBeenCalled();
    expect(mockSelf.clients.claim).toHaveBeenCalled();
  });

  test('fetch handler is a no-op function', () => {
    loadSW();
    expect(() => listeners['fetch']()).not.toThrow();
  });

  test('three event listeners are registered', () => {
    loadSW();
    expect(mockSelf.addEventListener).toHaveBeenCalledTimes(3);
  });
});
