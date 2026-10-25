import { vi } from 'vitest';

vi.mock('maplibre-gl', () => ({
  default: {
    Map: class {
      remove() {}
      on() {}
      flyTo() {}
      resize() {}
      setStyle() {}
    },
    NavigationControl: class {},
    Marker: class {
      setLngLat() { return this; }
      setPopup() { return this; }
      addTo() { return this; }
    },
    Popup: class {
      setHTML() { return this; }
    },
  },
}));

// Mock window on globalThis if running in node environment
if (typeof globalThis.window === 'undefined') {
  (globalThis as unknown as { window: unknown }).window = globalThis;
}

// Mock window.matchMedia for theme tests
Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis.window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});
(globalThis as unknown as { localStorage: unknown }).localStorage = localStorageMock;

// Mock document.documentElement for theme tests
if (typeof globalThis.document === 'undefined') {
  const classList = new Set<string>();
  const attributes: Record<string, string> = {};
  const docEl = {
    classList: {
      add: (cls: string) => classList.add(cls),
      remove: (cls: string) => classList.delete(cls),
      contains: (cls: string) => classList.has(cls),
    },
    setAttribute: (k: string, v: string) => { attributes[k] = v; },
    getAttribute: (k: string) => attributes[k] || null,
    removeAttribute: (k: string) => { delete attributes[k]; },
  };
  (globalThis as unknown as { document: unknown }).document = {
    documentElement: docEl,
  };
}

// Mock FileReader for photo upload tests
if (typeof globalThis.FileReader === 'undefined') {
  class MockFileReader {
    result: string | null = null;
    onload: (() => void) | null = null;
    readAsDataURL() {
      this.result = 'data:image/jpeg;base64,mock';
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  }
  (globalThis as unknown as { FileReader: unknown }).FileReader = MockFileReader;
}
