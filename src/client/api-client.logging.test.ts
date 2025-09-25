import axios from 'axios';
import { PoEApiClient } from './api-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoEApiClient logging', () => {
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: {} },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('logs cURL for requests at headers level with redacted auth', async () => {
    const lines: string[] = [];
    // const client = new PoEApiClient({
    //   userAgent: 'OAuth TestApp/1.0.0 (contact: test@example.com)',
    //   accessToken: 'secret-token',
    //   logLevel: 'headers',
    //   logger: (l) => lines.push(l),
    // });

    // request interceptor registered
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();

    const requestHandler = mockAxiosInstance.interceptors.request.use.mock
      .calls[0][0] as (cfg: any) => any;
    const responseHandler = mockAxiosInstance.interceptors.response.use.mock
      .calls[0][0] as (resp: any) => any;

    const cfg = {
      method: 'get',
      url: '/profile',
      baseURL: 'https://api.pathofexile.com',
      headers: {
        'User-Agent': 'OAuth TestApp/1.0.0 (contact: test@example.com)',
        Authorization: 'Bearer secret-token',
      },
    };

    const requestOut = await requestHandler(cfg);
    expect(requestOut).toBe(cfg);

    await responseHandler({
      status: 200,
      config: cfg,
      data: { ok: true },
      headers: {},
    });

    // Should include a cURL with redacted Authorization
    const curl = lines.find((l) => l.startsWith('curl '));
    expect(curl).toBeTruthy();
    expect(curl).toContain("-X GET 'https://api.pathofexile.com/profile'");
    expect(curl).toContain(
      "-H 'User-Agent: OAuth TestApp/1.0.0 (contact: test@example.com)'"
    );
    expect(curl).toContain("-H 'Authorization: ***'");

    // Summary + response lines
    expect(lines.some((l) => l.startsWith('[PoE SDK] -> GET'))).toBe(true);
    expect(lines.some((l) => l.startsWith('[PoE SDK] <- 200 GET'))).toBe(true);
  });

  it('logs request/response bodies at body level and includes --data-raw for POST', async () => {
    const lines: string[] = [];
    new PoEApiClient({
      userAgent: 'OAuth TestApp/1.0.0 (contact: test@example.com)',
      accessToken: 'secret-token',
      logLevel: 'body',
      logger: (l) => lines.push(l),
    });

    const requestHandler = mockAxiosInstance.interceptors.request.use.mock
      .calls[0][0] as (cfg: any) => any;
    const responseHandler = mockAxiosInstance.interceptors.response.use.mock
      .calls[0][0] as (resp: any) => any;

    const cfg = {
      method: 'post',
      url: '/item-filter',
      baseURL: 'https://api.pathofexile.com',
      headers: {
        'User-Agent': 'OAuth TestApp/1.0.0 (contact: test@example.com)',
        Authorization: 'Bearer secret-token',
      },
      data: { filter_name: 'x', realm: 'pc', filter: '{}' },
    };

    await requestHandler(cfg);
    await responseHandler({
      status: 200,
      config: cfg,
      data: { ok: true },
      headers: {},
    });

    const curl = lines.find((l) => l.startsWith('curl '));
    expect(curl).toBeTruthy();
    expect(curl).toContain("-X POST 'https://api.pathofexile.com/item-filter'");
    expect(curl).toContain('--data-raw');

    // Body lines present
    expect(lines.some((l) => l.includes('[PoE SDK] request body:'))).toBe(true);
    expect(lines.some((l) => l.includes('[PoE SDK] response body:'))).toBe(
      true
    );
  });
});
