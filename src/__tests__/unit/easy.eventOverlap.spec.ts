import events from '../../__mocks__/response/events.json';
import { Event } from '../../types';
import { getInvalidDate } from '../../utils/dateUtils';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    expect(parseDateTime('2025-07-01', '14:30')).toEqual(new Date('2025-07-01T14:30'));
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-50-01', '14:30')).toEqual(getInvalidDate());
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    expect(parseDateTime('2025-07-01', '25:30')).toEqual(getInvalidDate());
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    expect(parseDateTime('', '14:30')).toEqual(getInvalidDate());
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '준일님이랑 밥먹고싶다',
        date: '2025-10-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '준일님은 뭐 좋아하세요?',
        location: '어디든.... ',
        category: '친목',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toEqual({
      start: new Date('2025-10-01T09:00'),
      end: new Date('2025-10-01T10:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '준일님이랑 밥먹고싶다',
        date: '2025-50-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '준일님은 뭐 좋아하세요?',
        location: '어디든.... ',
        category: '친목',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toEqual({
      start: getInvalidDate(),
      end: getInvalidDate(),
    });
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    expect(
      convertEventToDateRange({
        id: '1',
        title: '준일님이랑 밥먹고싶다',
        date: '2025-10-01',
        startTime: '25:00',
        endTime: '59:00',
        description: '준일님은 뭐 좋아하세요?',
        location: '어디든.... ',
        category: '친목',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      })
    ).toEqual({
      start: getInvalidDate(),
      end: getInvalidDate(),
    });
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(
      isOverlapping(
        {
          id: '1',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        }
      )
    ).toEqual(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(
      isOverlapping(
        {
          id: '1',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        {
          id: '2',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-10-01',
          startTime: '11:00',
          endTime: '12:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        }
      )
    ).toEqual(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '3',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-10-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        events.events as Event[]
      )
    ).toEqual([
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

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(
      findOverlappingEvents(
        {
          id: '3',
          title: '준일님이랑 밥먹고싶다',
          date: '2025-08-31',
          startTime: '09:00',
          endTime: '10:00',
          description: '준일님은 뭐 좋아하세요?',
          location: '어디든.... ',
          category: '친목',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
        events.events as Event[]
      )
    ).toEqual([]);
  });
});
