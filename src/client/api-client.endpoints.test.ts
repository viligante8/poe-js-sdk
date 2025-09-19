import axios from 'axios';
import { PoEApiClient } from './api-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoEApiClient endpoints', () => {
  let client: PoEApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: {} },
      interceptors: {
        response: { use: jest.fn() },
        request: { use: jest.fn() },
      },
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    client = new PoEApiClient({
      userAgent: 'OAuth Test/1.0.0 (contact: test@example.com)',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getLeagues supports options and returns typed envelope', async () => {
    const mock = { leagues: [{ id: 'Standard', realm: 'poe2' }] } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getLeagues({ realm: 'poe2', type: 'main', limit: 50, offset: 5 });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league', {
      params: { realm: 'poe2', type: 'main', limit: 50, offset: 5 },
    });
    expect(res).toEqual(mock);
  });

  it('getLeague returns typed envelope and passes realm', async () => {
    const mock = { league: { id: 'Affliction', realm: 'poe2' } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getLeague('Affliction', 'poe2');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league/Affliction', { params: { realm: 'poe2' } });
    expect(res).toEqual(mock);
  });

  it('getLeagueLadder passes params and returns typed envelope', async () => {
    const mock = { league: { id: 'Hardcore', realm: 'pc' }, ladder: { total: 10, entries: [] } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getLeagueLadder('Hardcore', { realm: 'pc', sort: 'class', class: 'witch', limit: 100, offset: 200 });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league/Hardcore/ladder', {
      params: { realm: 'pc', sort: 'class', class: 'witch', limit: 100, offset: 200 },
    });
    expect(res).toEqual(mock);
  });

  it('getLeagueEventLadder returns typed envelope', async () => {
    const mock = { league: { id: 'Event', realm: 'pc' }, ladder: { total: 5, entries: [] } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getLeagueEventLadder('Event', { realm: 'pc', limit: 50 });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league/Event/event-ladder', {
      params: { realm: 'pc', limit: 50 },
    });
    expect(res).toEqual(mock);
  });

  it('getPvpMatchLadder returns typed envelope', async () => {
    const mock = { match: { id: 'S14-CTF', realm: 'pc' }, ladder: { total: 2, entries: [] } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getPvpMatchLadder('S14-CTF', { realm: 'pc', limit: 10, offset: 0 });
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/pvp-match/S14-CTF/ladder', {
      params: { realm: 'pc', limit: 10, offset: 0 },
    });
    expect(res).toEqual(mock);
  });

  it('getCurrencyExchange builds URL and returns typed response', async () => {
    const mock = { next_change_id: 123456, markets: [] } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getCurrencyExchange('poe2', '123');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/currency-exchange/poe2/123');
    expect(res).toEqual(mock);
  });

  it('getAccountLeagues returns typed envelope', async () => {
    const mock = { leagues: [{ id: 'Standard', realm: 'pc' }] } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getAccountLeagues('pc');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/account/leagues', { params: { realm: 'pc' } });
    expect(res).toEqual(mock);
  });

  it('guild stash endpoints return typed envelopes and build URL correctly', async () => {
    const mockList = { stashes: [{ id: 'tab1', name: 'Guild Tab', type: 'Premium' }] } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockList });
    const list = await client.getGuildStashes('Standard');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guild/stash/Standard');
    expect(list).toEqual(mockList);

    const mockOne = { stash: { id: 'tab1', name: 'Guild Tab', type: 'Premium' } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mockOne });
    const one = await client.getGuildStash('Standard', 'tab1', undefined, 'pc');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/guild/pc/stash/Standard/tab1');
    expect(one).toEqual(mockOne);
  });
});

