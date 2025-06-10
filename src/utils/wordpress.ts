import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { WordPressConfig } from '../types/wordpress';

/**
 * Класс для работы с WordPress REST API
 */
export default class WordPressClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private username: string;
  private password: string;

  /**
   * Создает экземпляр клиента WordPress API
   * @param config Конфигурация для WordPress API
   */
  constructor(config: WordPressConfig) {
    this.baseUrl = config.url.replace(/\/$/, '');
    this.username = config.username;
    this.password = config.password;

    this.client = axios.create({
      baseURL: `${this.baseUrl}/wp-json/wp/v2/`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Добавляем обработчик запросов для Basic Auth
    this.client.interceptors.request.use(this.handleRequest.bind(this));
  }

  /**
   * Обработчик запросов для добавления авторизации Basic Auth
   */
  private handleRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    // Кодируем учетные данные для Basic Auth
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    config.headers = {
      ...config.headers,
      'Authorization': `Basic ${auth}`
    };

    return config;
  }

  /**
   * Выполняет GET-запрос к WordPress API
   * @param endpoint Конечная точка API
   * @param params Параметры запроса
   */
  public async get(endpoint: string, params: any = {}): Promise<AxiosResponse> {
    try {
      return await this.client.get(endpoint, { params });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Выполняет POST-запрос к WordPress API
   * @param endpoint Конечная точка API
   * @param data Данные для отправки
   */
  public async post(endpoint: string, data: any = {}): Promise<AxiosResponse> {
    try {
      return await this.client.post(endpoint, data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Выполняет PUT-запрос к WordPress API
   * @param endpoint Конечная точка API
   * @param data Данные для обновления
   */
  public async put(endpoint: string, data: any = {}): Promise<AxiosResponse> {
    try {
      return await this.client.put(endpoint, data);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Выполняет DELETE-запрос к WordPress API
   * @param endpoint Конечная точка API
   * @param params Параметры запроса
   */
  public async delete(endpoint: string, params: any = {}): Promise<AxiosResponse> {
    try {
      return await this.client.delete(endpoint, { params });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Обработка ошибок API
   * @param error Объект ошибки
   */
  private handleError(error: any): void {
    if (error.response) {
      // Сервер ответил с кодом, отличным от 2xx
      console.error('WordPress API error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Запрос был сделан, но не получен ответ
      console.error('WordPress API request error:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('WordPress API config error:', error.message);
    }
  }

  /**
   * Проверяет доступность WordPress API
   */
  public async checkConnection(): Promise<boolean> {
    try {
      const response = await this.get('');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получает текущего пользователя
   */
  public async getCurrentUser(): Promise<AxiosResponse> {
    return this.get('users/me');
  }

  /**
   * Загружает медиафайл в WordPress
   * @param file Файл для загрузки (как FormData)
   * @param title Название файла
   */
  public async uploadMedia(file: FormData, title?: string): Promise<AxiosResponse> {
    const headers = {
      'Content-Disposition': title ? `attachment; filename="${title}"` : undefined,
      'Content-Type': 'multipart/form-data'
    };
    
    try {
      return await this.client.post('media', file, { headers });
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Получает информацию о WordPress
   */
  public async getSiteInfo(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/wp-json`);
    return response.data;
  }

  /**
   * Получает список доступных API конечных точек
   */
  public async getRoutes(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/wp-json/wp/v2`);
    return response.data.routes;
  }
}

/**
 * Convenience factory to create a WordPressClient instance.
 */
export function createWordPressClient(config: WordPressConfig): WordPressClient {
  return new WordPressClient(config);
}
