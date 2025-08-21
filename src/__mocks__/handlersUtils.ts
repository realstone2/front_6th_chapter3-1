import { randomUUID } from 'crypto';

import { http, HttpResponse } from 'msw';

import { server } from '../setupTests';
import { Event } from '../types';

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.
export const setupMockHandlerCreationError = () => {
  afterEach(() => {
    server.resetHandlers();
  });

  server.use(
    http.post('/api/events', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    })
  );
};

export const setupMockHandlerUpdatingError = () => {
  afterEach(() => {
    server.resetHandlers();
  });

  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    })
  );
};

export const setupMockHandlerDeletionError = () => {
  afterEach(() => {
    server.resetHandlers();
  });

  server.use(
    http.delete('/api/events/:id', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    })
  );
};

export const setupMockHandlerFetchError = () => {
  afterEach(() => {
    server.resetHandlers();
  });

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ message: 'Error' }, { status: 500 });
    })
  );
};

export const overrideMockHandler = (initEvents = [] as Event[]) => {
  let events = initEvents;

  afterEach(() => {
    server.resetHandlers();
  });

  server.use(
    ...[
      http.get('/api/events', () => {
        return HttpResponse.json({
          events,
        });
      }),

      http.post('/api/events', async ({ request }) => {
        const body = await request.clone().json();

        const prevEvents = events;

        const newEvent = { id: randomUUID(), ...body };

        events = [...prevEvents, newEvent];

        return HttpResponse.json(newEvent, { status: 201 });
      }),

      http.put<{ id: string }>('/api/events/:id', async ({ params, request }) => {
        const { id } = params;
        const body = await request.clone().json();

        const eventIndex = events.findIndex((event) => event.id === id);

        if (eventIndex > -1) {
          const newEvents = [...events];
          newEvents[eventIndex] = { ...events[eventIndex], ...body };

          events = newEvents;

          return HttpResponse.json(events[eventIndex]);
        } else {
          return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
        }
      }),

      http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
        const { id } = params;

        events = events.filter((event) => event.id !== id);

        return HttpResponse.json(null, { status: 204 });
      }),
    ]
  );
};
