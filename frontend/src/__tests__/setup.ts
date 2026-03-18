import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    const React = require('react');
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Silence console.error for expected test warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Warning:') || msg.includes('act(')) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});
