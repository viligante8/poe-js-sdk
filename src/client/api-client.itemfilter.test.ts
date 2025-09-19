import axios from 'axios';
import { PoEApiClient } from './api-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoEApiClient Item Filters', () => {
  let client: PoEApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      defaults: { headers: {} },
      interceptors: {
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    client = new PoEApiClient({
      userAgent: 'OAuth TestApp/1.0.0 (contact: test@example.com)',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getItemFilters returns typed envelope', async () => {
    const mock = { filters: [{ id: 'f1', filter_name: 'MyFilter', realm: 'poe2', type: 'Normal' }] } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getItemFilters();
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item-filter');
    expect(res).toEqual(mock);
  });

  it('getItemFilter returns typed envelope', async () => {
    const mock = { filter: { id: 'f1', filter_name: 'MyFilter', realm: 'poe2', type: 'Normal' } } as any;
    mockAxiosInstance.get.mockResolvedValueOnce({ data: mock });

    const res = await client.getItemFilter('f1');
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/item-filter/f1');
    expect(res).toEqual(mock);
  });

  it('createItemFilter passes validate=true and returns typed envelope', async () => {
    const body = {
      filter_name: 'MyFilter',
      realm: 'poe2' as const,
      filter: 'Show \n Class "Currency"',
      type: 'Normal' as const,
    };
    const mock = { filter: { id: 'newid', ...body } } as any;
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mock });

    const res = await client.createItemFilter(body, { validate: true });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      '/item-filter',
      body,
      { params: { validate: true } }
    );
    expect(res).toEqual(mock);
  });

  it('updateItemFilter passes validate=true and returns typed envelope', async () => {
    const patch = { description: 'Updated desc' } as any;
    const mock = { filter: { id: 'f1', filter_name: 'MyFilter', realm: 'poe2', type: 'Ruthless', description: 'Updated desc' } } as any;
    mockAxiosInstance.post.mockResolvedValueOnce({ data: mock });

    const res = await client.updateItemFilter('f1', patch, { validate: true });
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      '/item-filter/f1',
      patch,
      { params: { validate: true } }
    );
    expect(res).toEqual(mock);
  });
});
