import { randomUUID } from 'crypto';

import { act, renderHook, waitFor } from '@testing-library/react';

import {
  setupMockHandlerDeletionError,
  setupMockHandlerFetchError,
  overrideMockHandler,
} from '../../__mocks__/handlersUtils.ts';
import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  expect(result.current.events).toEqual(events);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  overrideMockHandler(events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  let newEvent = {
    id: randomUUID(),
    title: 'test',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  } satisfies Event;

  await act(async () => result.current.saveEvent(newEvent));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
      variant: 'success',
    });
  });

  expect(result.current.events).toEqual([...events, newEvent]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  overrideMockHandler(events as Event[]);

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });
  });

  let editEvent = {
    ...result.current.events[0],
    title: '준일님 짱짱맨',
    endTime: '13:00',
  } satisfies Event;

  await act(async () => result.current.saveEvent(editEvent));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
      variant: 'success',
    });
  });

  expect(result.current.events).toEqual([editEvent, ...events.slice(1)]);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  overrideMockHandler(events as Event[]);

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => result.current.deleteEvent(events[0].id));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', {
      variant: 'info',
    });
  });

  expect(result.current.events).toEqual(events.slice(1));
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  setupMockHandlerFetchError();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(result.current.events).toEqual([]);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  overrideMockHandler(events as Event[]);

  const { result } = renderHook(() => useEventOperations(true));

  await act(async () =>
    result.current.saveEvent({
      id: '123',
      title: 'test',
      date: '2025-01-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'none',
        interval: 0,
      },
      notificationTime: 10,
    })
  );

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
  });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  setupMockHandlerDeletionError();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => result.current.deleteEvent(events[0].id));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });
  });
});
