import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { events } from '../../__mocks__/response/events.json' assert { type: 'json' };
import { useSearch } from '../../hooks/useSearch.ts';
import { Event, RepeatInfo } from '../../types.ts';
import { setupMockDate } from '../utils.ts';

const TODAY = new Date('2025-10-01');
const SEARCH_KEYWORD = '준일님 짱짱맨';
setupMockDate(TODAY);

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const eventList = events.map((event) => ({
    ...event,
    repeat: event.repeat as RepeatInfo,
  })) satisfies Event[];

  const { result } = renderHook(() => useSearch(eventList, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toEqual(eventList);
});

// it('검색어에 맞는 이벤트만 필터링해야 한다', () => {});
// 검색어에 맞는 이벤트만 필터링해야 한다와 통합. 같은 분할 그룹의 테스트
it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const eventList = events.map((event) => ({
    ...event,
    repeat: event.repeat as RepeatInfo,
  })) satisfies Event[];

  const { result } = renderHook(() => useSearch(eventList, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm(SEARCH_KEYWORD);
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '2',
      title: '준일님 짱짱맨',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '준일님 짱짱맨',
      location: '준일님 코치방',
      category: '멘토링',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('주간에 해당하는 이벤트만 반환해야 한다', () => {
  const eventList = events.map((event) => ({
    ...event,
    repeat: event.repeat as RepeatInfo,
  })) satisfies Event[];

  const { result } = renderHook(() => useSearch(eventList, new Date(), 'week'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('월간에 해당하는 이벤트만 반환해야 한다', () => {
  const eventList = events.map((event) => ({
    ...event,
    repeat: event.repeat as RepeatInfo,
  })) satisfies Event[];

  const { result } = renderHook(() => useSearch(eventList, new Date(), 'month'));

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '준일님 짱짱맨',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '준일님 짱짱맨',
      location: '준일님 코치방',
      category: '멘토링',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  beforeEach(() => {
    setupMockDate(TODAY);
  });

  const eventList = events.map((event) => ({
    ...event,
    repeat: event.repeat as RepeatInfo,
  })) satisfies Event[];

  const { result } = renderHook(() => useSearch(eventList, new Date(), 'month'));

  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-01',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);

  act(() => {
    result.current.setSearchTerm('');
  });

  expect(result.current.filteredEvents).toEqual(eventList);
});
