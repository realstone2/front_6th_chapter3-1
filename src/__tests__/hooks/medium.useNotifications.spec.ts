import { act, renderHook } from '@testing-library/react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { setupMockDate } from '../utils.ts';

setupMockDate(new Date('2025-10-01T08:50:00'));

// 불필요한 테스트(?) 초기 상태에 알림이 없는게 맞는것인가?
// 의미가 있는 테스트인 것인가?
// 목적이 있는 것인가?
// it('초기 상태에서는 알림이 없어야 한다', () => {
//   const { result } = renderHook(() => useNotifications(events as Event[]));

//   expect(result.current.notifications).toEqual([]);
// });

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', async () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 기존 회의 일정이 시작됩니다.',
    },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toEqual([]);
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', async () => {
  const { result } = renderHook(() => useNotifications(events as Event[]));

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 기존 회의 일정이 시작됩니다.',
    },
  ]);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });

  expect(result.current.notifications).toEqual([
    {
      id: '1',
      message: '10분 후 기존 회의 일정이 시작됩니다.',
    },
  ]);
});
