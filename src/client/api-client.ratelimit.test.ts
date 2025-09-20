import axios from 'axios';
import { PoEApiClient } from './api-client';
import { PoEApiError } from '../errors/api-error';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoEApiClient rate limiting & errors', () => {
  let mockAxiosInstance: any;
  let requestHandler: ((cfg: any) => Promise<any>) | undefined;
  let responseFulfilled: ((resp: any) => any) | undefined;
  let responseRejected: ((err: any) => any) | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    requestHandler = undefined;
    responseFulfilled = undefined;
    responseRejected = undefined;

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: {} },
      interceptors: {
        request: {
          use: jest.fn((fn: any) => {
            requestHandler = fn;
          }),
        },
        response: {
          use: jest.fn((ok: any, err: any) => {
            responseFulfilled = ok;
            responseRejected = err;
          }),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    new PoEApiClient({
      userAgent: 'OAuth Test/1.0.0 (contact: test@example.com)',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('waits before requests when state headers indicate active restriction', async () => {
    expect(requestHandler).toBeDefined();
    expect(responseFulfilled).toBeDefined();

    // Simulate a response with active client state: 11 hits, 5s window, 10s restriction
    const headers = {
      'x-rate-limit-client-state': '11:5:10',
    } as any;
    responseFulfilled!({ headers, data: {}, status: 200 });

    const cfg = { url: '/profile' };
    const p = requestHandler!(cfg);

    // Should not resolve until we advance timers by 10s
    let resolved = false;
    p.then(() => (resolved = true));
    expect(resolved).toBe(false);

    await jest.advanceTimersByTimeAsync(10_000);
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  it('sets wait based on Retry-After on 429', async () => {
    expect(requestHandler).toBeDefined();
    expect(responseRejected).toBeDefined();

    const err = {
      response: {
        status: 429,
        headers: { 'retry-after': '7' },
        data: {},
      },
      config: { url: '/league' },
    };

    try {
      responseRejected!(err);
    } catch {
      void 0;
    }

    const cfg = { url: '/league' };
    const p = requestHandler!(cfg);
    let resolved = false;
    p.then(() => (resolved = true));
    expect(resolved).toBe(false);
    await jest.advanceTimersByTimeAsync(7_000);
    await Promise.resolve();
    expect(resolved).toBe(true);
  });

  it('throws PoEApiError on structured API error responses', () => {
    expect(responseRejected).toBeDefined();

    const err = {
      response: {
        status: 400,
        headers: {},
        data: { error: { code: 3, message: 'Rate limit exceeded' } },
      },
      config: { url: '/profile' },
    };

    expect(() => responseRejected!(err)).toThrow(PoEApiError);
  });
});
