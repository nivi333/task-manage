// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia for Ant Design responsive utilities
// JSDOM doesn't implement matchMedia; AntD Grid/useBreakpoint relies on it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => {
    let matches = false;
    const listeners: Array<(e: { matches: boolean; media: string }) => void> = [];
    const mql = {
      get matches() { return matches; },
      media: query,
      onchange: null as any,
      addListener: (cb: (e: { matches: boolean; media: string }) => void) => {
        listeners.push(cb);
        cb({ matches, media: query });
      },
      removeListener: (cb: (e: { matches: boolean; media: string }) => void) => {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      },
      addEventListener: (_: string, cb: (e: { matches: boolean; media: string }) => void) => {
        listeners.push(cb);
        cb({ matches, media: query });
      },
      removeEventListener: (_: string, cb: (e: { matches: boolean; media: string }) => void) => {
        const i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      },
      dispatchEvent: jest.fn(),
    } as any;
    return mql;
  }),
});
