import { randomUUID } from 'crypto';
import fs from 'fs';

import { http, HttpResponse } from 'msw';

import { events } from '../__mocks__/response/events.json' assert { type: 'json' };

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({
      events: events,
    });
  }),

  http.post('/api/events', async ({ request }) => {
    const body = await request.clone().json();

    const prevEvents = events;

    const newEvent = { id: randomUUID(), ...body };

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/events.json`,
      JSON.stringify({
        events: [...prevEvents, newEvent],
      })
    );

    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.put<{ id: string }>('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.clone().json();

    const eventIndex = events.findIndex((event) => event.id === id);
    if (eventIndex > -1) {
      const newEvents = [...events];
      newEvents[eventIndex] = { ...events[eventIndex], ...body };

      fs.writeFileSync(
        `${__dirname}/src/__mocks__/response/events.json`,
        JSON.stringify({
          events: newEvents,
        })
      );

      return HttpResponse.json(events[eventIndex]);
    } else {
      return HttpResponse.json({ message: 'Event not found' }, { status: 404 });
    }
  }),

  http.delete<{ id: string }>('/api/events/:id', ({ params }) => {
    const { id } = params;

    fs.writeFileSync(
      `${__dirname}/src/__mocks__/response/events.json`,
      JSON.stringify({
        events: events.filter((event) => event.id !== id),
      })
    );

    return HttpResponse.json(null, { status: 204 });
  }),
];
