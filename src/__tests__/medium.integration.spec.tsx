import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  render,
  screen,
  within,
  act,
  renderHook,
  findByText,
  waitFor,
} from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { overrideMockHandler, setupMockHandlerCreationError } from '../__mocks__/handlersUtils';
import App from '../App';
import { useEventOperations } from '../hooks/useEventOperations';
import { server } from '../setupTests';
import { Event } from '../types';

const events = [
  {
    title: '팀 회의',
    date: '2025-09-12',
    startTime: '10:00',
    endTime: '11:00',
    description: '준일님최고입니다',
    location: '선릉',
    category: '회의',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
    id: '1',
  },
  {
    title: '점심식사',
    date: '2025-09-12',
    startTime: '12:00',
    endTime: '13:00',
    description: '점심먹자!',
    location: '선릉',
    category: '회의',
    repeat: {
      type: 'none',
      interval: 1,
    },
    notificationTime: 10,
    id: '2',
  },
] satisfies Event[];

const renderApp = () => {
  const theme = createTheme();
  return render(
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </>
  );
};

describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-09-10'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    const user = userEvent.setup();

    overrideMockHandler([]);
    renderApp();

    await screen.findByText('일정 로딩 완료!');

    await user.type(screen.getByLabelText('제목'), '팀 회의');
    await user.type(screen.getByLabelText('날짜'), '2025-09-12');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '준일님최고입니다');
    await user.type(screen.getByLabelText('위치'), '선릉');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    const eventTitleElements = screen.getAllByText('팀 회의');

    expect(eventTitleElements).toHaveLength(2);
    expect(eventTitleElements[0]).toBeVisible();
    expect(eventTitleElements[1]).toBeVisible();

    expect(await screen.findByText('10:00 - 11:00')).toBeVisible();
    expect(await screen.findByText('준일님최고입니다')).toBeVisible();
    expect(await screen.findByText('선릉')).toBeVisible();

    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    const user = userEvent.setup();
    vi.setSystemTime(new Date('2025-09-10'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('제목'));
    await user.type(screen.getByLabelText('제목'), '햄버거');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    const eventTitleElements = screen.getAllByText('햄버거');

    expect(eventTitleElements).toHaveLength(2);
    expect(eventTitleElements[0]).toBeVisible();
    expect(eventTitleElements[1]).toBeVisible();
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    const user = userEvent.setup();

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const deleteButtons = screen.getAllByLabelText('Delete event');
    await user.click(deleteButtons[0]);

    await screen.findByText('일정이 삭제되었습니다.');

    expect(screen.queryByText('삭제할겁니다')).not.toBeInTheDocument();
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-01'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const selectContainer = screen.getByLabelText('뷰 타입 선택');

    const select = within(selectContainer).getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByLabelText('week-option'));

    expect(screen.queryByText('팀 회의')).not.toBeInTheDocument();
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const selectContainer = screen.getByLabelText('뷰 타입 선택');

    const select = within(selectContainer).getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByLabelText('week-option'));

    const weekViewContainer = screen.getByTestId('week-view');

    expect(within(weekViewContainer).getByText('팀 회의')).toBeVisible();
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-08-01'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const selectContainer = screen.getByLabelText('뷰 타입 선택');

    const select = within(selectContainer).getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByLabelText('month-option'));

    expect(screen.getByText('검색 결과가 없습니다.')).toBeVisible();
  });

  // 월별 뷰에 일정이 정확히 표시되는지 확인한다 => 월별 뷰에 일정이 있으면 일정이 표시된다
  it('월별 뷰에 일정이 있으면 일정이 표시된다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const selectContainer = screen.getByLabelText('뷰 타입 선택');

    const select = within(selectContainer).getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByLabelText('month-option'));

    const monthView = screen.getByTestId('month-view');

    expect(within(monthView).getByText('팀 회의')).toBeVisible();
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-01-01'));

    overrideMockHandler([]);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const selectContainer = screen.getByLabelText('뷰 타입 선택');

    const select = within(selectContainer).getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByLabelText('month-option'));

    const monthView = screen.getByTestId('month-view');

    expect(within(monthView).getByText('신정')).toBeVisible();
  });
});

describe('검색 기능', () => {
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    const user = userEvent.setup();

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '준일님?');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeVisible();
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    const user = userEvent.setup();
    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '팀 회의');

    expect(screen.getAllByText('팀 회의')).toHaveLength(2);
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const searchInput = screen.getByLabelText('일정 검색');
    await user.type(searchInput, '준일님 화이팅!');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeVisible();

    await user.clear(searchInput);

    expect(screen.getAllByText('팀 회의')).toHaveLength(2);
  });
});

describe('일정 충돌', () => {
  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    await user.type(screen.getByLabelText('제목'), '팀 회의 2');
    await user.type(screen.getByLabelText('날짜'), '2025-09-12');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '준일님최고입니다');
    await user.type(screen.getByLabelText('위치'), '선릉');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeVisible();
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const user = userEvent.setup();

    vi.setSystemTime(new Date('2025-09-12'));

    overrideMockHandler(events);

    renderApp();

    await screen.findByText('일정 로딩 완료!');

    const editButtons = screen.getAllByLabelText('Edit event');
    await user.click(editButtons[0]);

    await user.clear(screen.getByLabelText('시작 시간'));
    await user.clear(screen.getByLabelText('종료 시간'));

    await user.type(screen.getByLabelText('시작 시간'), '12:00');
    await user.type(screen.getByLabelText('종료 시간'), '13:00');

    const submitButton = screen.getByTestId('event-submit-button');

    await user.click(submitButton);

    expect(await screen.findByText('일정 겹침 경고')).toBeVisible();
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  vi.setSystemTime(new Date('2025-09-12T09:50:00'));

  overrideMockHandler(events);

  renderApp();

  await screen.findByText('일정 로딩 완료!');

  expect(await screen.findByText('10분 후 팀 회의 일정이 시작됩니다.')).toBeVisible();
});
