import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';
import { setupMockDate } from '../utils';

setupMockDate(new Date('2025-07-01'));

describe('getFilteredEvents', () => {
  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    expect(getFilteredEvents(events, '이벤트 2', new Date(), 'week')).toEqual([
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('주간 뷰에서 2025-07-01 주의 이벤트만 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date(), 'week')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('월간 뷰에서 2025년 7월의 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date(), 'month')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },

      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-31',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 3',
        location: '이벤트 3 위치',
        category: '이벤트 3 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    expect(getFilteredEvents(events, '이벤트', new Date(), 'week')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    expect(getFilteredEvents(events, '', new Date(), 'month')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },

      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-31',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 3',
        location: '이벤트 3 위치',
        category: '이벤트 3 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    expect(getFilteredEvents(events, 'eVeNt 1', new Date(), 'week')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    expect(getFilteredEvents(events, '', new Date(), 'month')).toEqual([
      {
        id: '1',
        title: '이벤트 1',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 1',
        location: '이벤트 1 위치',
        category: '이벤트 1 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '이벤트 2',
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 2',
        location: '이벤트 2 위치',
        category: '이벤트 2 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },

      {
        id: '3',
        title: '이벤트 3',
        date: '2025-07-31',
        startTime: '09:00',
        endTime: '10:00',
        description: 'EVENT 3',
        location: '이벤트 3 위치',
        category: '이벤트 3 카테고리',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
    ]);
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    expect(getFilteredEvents([], '', new Date(), 'week')).toEqual([]);
  });
});

const events = [
  {
    id: '1',
    title: '이벤트 1',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'EVENT 1',
    location: '이벤트 1 위치',
    category: '이벤트 1 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '이벤트 2',
    date: '2025-07-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'EVENT 2',
    location: '이벤트 2 위치',
    category: '이벤트 2 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },

  {
    id: '3',
    title: '이벤트 3',
    date: '2025-07-31',
    startTime: '09:00',
    endTime: '10:00',
    description: 'EVENT 3',
    location: '이벤트 3 위치',
    category: '이벤트 3 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },

  {
    id: '4',
    title: '이벤트 4',
    date: '2025-08-01',
    startTime: '09:00',
    endTime: '10:00',
    description: 'EVENT 4',
    location: '이벤트 4 위치',
    category: '이벤트 4 카테고리',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
] satisfies Event[];
