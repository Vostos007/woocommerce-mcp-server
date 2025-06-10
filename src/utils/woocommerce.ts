import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createHmac } from 'crypto';
import * as oauth1a from 'oauth-1.0a';
import { WooCommerceConfig } from '../types/woocommerce';

/**
 * Класс для работы с WooCommerce REST API
 */
export default class WooCommerceClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;
  private version: string;

  /**
   * Создает экземпляр клиента WooCommerce API
   * @param config Конфигурация для WooCommerce API
   */
  constructor(config: WooCommerceConfig) {
    this.baseUrl = config.url.replace(/\/$/, '');
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.version = config.version || 'wc/v3';

    this.client = axios.create({
      baseURL: `${this.baseUrl}/wp-json/${this.version}/`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Добавляем обработчик запросов для OAuth
    this.client.interceptors.request.use(this.handleRequest.bind(this));
  }

  /**
   * Обработчик запросов для добавления авторизации OAuth
   */
  private handleRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    const url = new URL(config.url || '', `${this.baseUrl}/wp-json/${this.version}/`);
    const isHttps = url.protocol === 'https:';

    // Для HTTPS используем параметры запроса
    if (isHttps) {
      const params = new URLSearchParams(url.search);
      params.append('consumer_key', this.consumerKey);
      params.append('consumer_secret', this.consumerSecret);
      
      config.params = {
        ...config.params,
        consumer_key: this.consumerKey,
        consumer_secret: this.consumerSecret
      };
      
      return config;
    }

    // Для HTTP используем OAuth1.0a
    const oauth = new oauth1a({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret
      },
      signature_method: 'HMAC-SHA256',
      hash_function(base_string, key) {
        return createHmac('sha256', key)
          .update(base_string)
          .digest('base64');
      }
    });

    const requestData = {
      url: url.toString(),
      method: config.method || 'GET'
    };

    const oauthHeader = oauth.toHeader(oauth.authorize(requestData));
    config.headers = {
      ...config.headers,
      ...oauthHeader
    };

    return config;
  }

  /**
   * Выполняет GET-запрос к WooCommerce API
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
   * Выполняет POST-запрос к WooCommerce API
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
   * Выполняет PUT-запрос к WooCommerce API
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
   * Выполняет DELETE-запрос к WooCommerce API
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
      console.error('WooCommerce API error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Запрос был сделан, но не получен ответ
      console.error('WooCommerce API request error:', error.request);
    } else {
      // Произошла ошибка при настройке запроса
      console.error('WooCommerce API config error:', error.message);
    }
  }

  /**
   * Проверяет доступность WooCommerce API
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
   * Получает информацию о системе
   */
  public async getSystemStatus(): Promise<AxiosResponse> {
    return this.get('system_status');
  }

  /**
   * Выполняет пакетный запрос (batch request)
   * @param endpoint Конечная точка API
   * @param operations Операции для выполнения (create, update, delete)
   */
  public async batch(endpoint: string, operations: {
    create?: any[],
    update?: any[],
    delete?: number[]
  }): Promise<AxiosResponse> {
    try {
      return await this.client.post(`${endpoint}/batch`, operations);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }
}

/**
 * Convenience factory to create a WooCommerceClient instance.
 */
export function createWooCommerceClient(config: WooCommerceConfig): WooCommerceClient {
  return new WooCommerceClient(config);
}
