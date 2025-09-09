import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

afterEach(() => {
  cleanup();
});

const redirectMock = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('next/navigation')>()),
    redirect: redirectMock,
  };
});

beforeEach(() => {
  redirectMock.mockClear();
});
