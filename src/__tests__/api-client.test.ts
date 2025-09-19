import axios from 'axios';
import { PoEApiClient } from '../client/api-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PoEApiClient', () => {
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
      accessToken: 'test-token',
      userAgent: 'OAuth TestApp/1.0.0 (contact: test@example.com)',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.pathofexile.com',
        headers: {
          'User-Agent': 'OAuth TestApp/1.0.0 (contact: test@example.com)',
          Authorization: 'Bearer test-token',
        },
      });
    });

    it('should create axios instance without auth header when no token provided', () => {
      jest.resetAllMocks();
      mockedAxios.create.mockReturnValue(mockAxiosInstance);

      new PoEApiClient({
        userAgent: 'OAuth TestApp/1.0.0 (contact: test@example.com)',
      });

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.pathofexile.com',
        headers: {
          'User-Agent': 'OAuth TestApp/1.0.0 (contact: test@example.com)',
        },
      });
    });
  });

  describe('getProfile', () => {
    it('should fetch user profile', async () => {
      const mockProfile = {
        uuid: 'test-uuid',
        name: 'TestUser',
        realm: 'pc' as const,
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await client.getProfile();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/profile');
      expect(result).toEqual(mockProfile);
    });
  });

  describe('getLeagues', () => {
    it('should fetch leagues without realm filter', async () => {
      const mockLeagues = [
        { id: 'Standard', realm: 'pc' as const },
        { id: 'Hardcore', realm: 'pc' as const },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: { leagues: mockLeagues } });

      const result = await client.getLeagues();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league', {
        params: {},
      });
      expect(result).toEqual({ leagues: mockLeagues });
    });

    it('should fetch leagues with realm filter', async () => {
      const mockLeagues = [{ id: 'Standard', realm: 'xbox' as const }];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: { leagues: mockLeagues } });

      const result = await client.getLeagues('xbox');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/league', {
        params: { realm: 'xbox' },
      });
      expect(result).toEqual({ leagues: mockLeagues });
    });
  });

  describe('getCharacters', () => {
    it('should fetch characters without realm', async () => {
      const mockCharacters = [
        {
          id: 'char1',
          name: 'TestChar',
          realm: 'pc' as const,
          class: 'Witch',
          league: 'Standard',
          level: 90,
          experience: 1000000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: { characters: mockCharacters } });

      const result = await client.getCharacters();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/character');
      expect(result).toEqual({ characters: mockCharacters });
    });

    it('should fetch characters with realm', async () => {
      const mockCharacters = [
        {
          id: 'char1',
          name: 'TestChar',
          realm: 'xbox' as const,
          class: 'Witch',
          league: 'Standard',
          level: 90,
          experience: 1000000,
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: { characters: mockCharacters } });

      const result = await client.getCharacters('xbox');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/character/xbox');
      expect(result).toEqual({ characters: mockCharacters });
    });
  });

  describe('setAccessToken', () => {
    it('should update authorization header', () => {
      client.setAccessToken('new-token');

      expect(mockAxiosInstance.defaults.headers.Authorization).toBe(
        'Bearer new-token'
      );
    });
  });
});
