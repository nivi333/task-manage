// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia for Ant Design responsive utilities
// JSDOM doesn't implement matchMedia; AntD Grid/useBreakpoint relies on it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.open used by bugService mailto fallback
(window as any).open = (window as any).open || jest.fn();

// Polyfill ResizeObserver used by Ant Design components
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

(window as any).ResizeObserver = (window as any).ResizeObserver || MockResizeObserver;
(global as any).ResizeObserver = (global as any).ResizeObserver || MockResizeObserver;
