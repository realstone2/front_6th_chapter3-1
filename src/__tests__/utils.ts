import { render, renderHook, screen } from '@testing-library/react';

import { useEventOperations } from '../hooks/useEventOperations';
import { fillZero } from '../utils/dateUtils';

export const assertDate = (date1: Date, date2: Date) => {
  expect(date1.getDate()).toBe(date2.getDate());
};

export const parseHM = (timestamp: number) => {
  const date = new Date(timestamp);
  const h = fillZero(date.getHours());
  const m = fillZero(date.getMinutes());
  return `${h}:${m}`;
};

export const setupMockDate = (date: Date) => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });
};
