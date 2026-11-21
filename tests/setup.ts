import { vi } from 'vitest';

// In-memory mock storage
const mockStorageData: Record<string, any> = {};

// WebExtension Browser / Chrome API Mock
const mockStorage = {
  local: {
    get: vi.fn(async (keys?: string | string[] | Record<string, any>) => {
      if (!keys) return { ...mockStorageData };
      if (typeof keys === 'string') {
        return { [keys]: mockStorageData[keys] };
      }
      if (Array.isArray(keys)) {
        const result: Record<string, any> = {};
        for (const k of keys) {
          result[k] = mockStorageData[k];
        }
        return result;
      }
      return { ...mockStorageData };
    }),
    set: vi.fn(async (items: Record<string, any>) => {
      Object.assign(mockStorageData, items);
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const arr = Array.isArray(keys) ? keys : [keys];
      for (const k of arr) {
        delete mockStorageData[k];
      }
    }),
    clear: vi.fn(async () => {
      for (const k of Object.keys(mockStorageData)) {
        delete mockStorageData[k];
      }
    }),
  },
};

const mockRuntime = {
  sendMessage: vi.fn(),
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

const mockAlarms = {
  create: vi.fn(),
  onAlarm: {
    addListener: vi.fn(),
  },
};

const mockTabs = {
  create: vi.fn(),
};

// Polyfill globals
(globalThis as any).browser = {
  storage: mockStorage,
  runtime: mockRuntime,
  alarms: mockAlarms,
  tabs: mockTabs,
};

(globalThis as any).chrome = (globalThis as any).browser;

export function resetMockStorage() {
  for (const k of Object.keys(mockStorageData)) {
    delete mockStorageData[k];
  }
}
