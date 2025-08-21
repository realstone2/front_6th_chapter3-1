import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate, setupMockDate } from '../utils.ts';

describe('초기 상태', () => {
  setupMockDate(new Date('2025-10-01'));
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toEqual({
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-10-08'));
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-24'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-11-01'));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('month');
  });

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-01'));
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });
});

//아래는 헛짓거리 한 내용입니다.
// import { act, renderHook } from '@testing-library/react';

// import { HOLIDAY_RECORD_BY_MONTH } from '../../apis/fetchHolidays.ts';
// import { useCalendarView } from '../../hooks/useCalendarView.ts';
// import { assertDate, setupMockDate } from '../utils.ts';

// const TODAY = new Date('2025-10-01');
// const TARGET_DATE = new Date('2025-03-01');

// setupMockDate(TODAY);

// describe('초기 상태', () => {
//   it('view는 "month"이어야 한다', async () => {
//     const { result } = renderHook(() => useCalendarView());

//     expect(result.current.view).toBe('month');
//   });

//   it(`currentDate는 오늘 날짜인 ${dayjs().format('YYYY-MM-DD')}이어야 한다`, () => {
//     const { result } = renderHook(() => useCalendarView());

//     assertDate(result.current.currentDate, new Date());
//   });

//   it('holidays는 오늘 날짜에 해당하는 공휴일 정보를 포함하고 있어야 한다', async () => {
//     const { result } = renderHook(() => useCalendarView());

//     const holidays = HOLIDAY_RECORD_BY_MONTH[dayjs().format('YYYY-MM')];

//     expect(result.current.holidays).toEqual(holidays);
//   });
// });

// it("view를 'week'으로 변경 시 적절하게 반영된다", async () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.setView('week');
//   });

//   expect(result.current.view).toBe('week');
// });

// it('주간 뷰에서 다음으로 navigate시 7일 후 날짜로 지정이 된다', () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.setView('week');
//   });

//   act(() => {
//     result.current.navigate('next');
//   });

//   const nextDate = new Date();
//   nextDate.setDate(nextDate.getDate() + 7);

//   assertDate(result.current.currentDate, nextDate);
// });

// it('주간 뷰에서 이전으로 navigate시 7일 전 날짜로 지정이 된다', () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.setView('week');
//   });

//   act(() => {
//     result.current.navigate('prev');
//   });

//   const prevDate = new Date();
//   prevDate.setDate(prevDate.getDate() - 7);

//   assertDate(result.current.currentDate, prevDate);
// });

// it('월간 뷰에서 다음으로 navigate시 한 달 후의 첫번째 날짜로 지정이 된다', () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.navigate('next');
//   });

//   const nextDate = new Date();
//   nextDate.setMonth(nextDate.getMonth() + 1);
//   nextDate.setDate(1);

//   assertDate(result.current.currentDate, nextDate);
// });

// it('월간 뷰에서 이전으로 navigate시 한 달 전의 첫번째 날짜로 지정이 된다', () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.navigate('prev');
//   });

//   const prevDate = new Date();
//   prevDate.setMonth(prevDate.getMonth() - 1);
//   prevDate.setDate(1);

//   assertDate(result.current.currentDate, prevDate);
// });

// it(`currentDate가 '${dayjs(TARGET_DATE).format(
//   'YYYY-MM-DD'
// )}'로 변경되면 해당 달의 휴일이 올바르게 업데이트되어야 한다`, async () => {
//   const { result } = renderHook(() => useCalendarView());

//   act(() => {
//     result.current.setCurrentDate(TARGET_DATE);
//   });

//   expect(result.current.holidays).toEqual(
//     HOLIDAY_RECORD_BY_MONTH[dayjs(TARGET_DATE).format('YYYY-MM')]
//   );
// });
