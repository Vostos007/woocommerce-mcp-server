import crypto from 'crypto';
import { createWooCommerceClient } from './woocommerce';
import { WooCommerceConfig } from '../types/woocommerce';

// Типы вебхуков WooCommerce
export enum WebhookTopic {
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_DELETED = 'order.deleted',
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  CUSTOMER_DELETED = 'customer.deleted',
}

// Интерфейс для данных вебхука
export interface WebhookData {
  id: number;
  name: string;
  status: string;
  topic: string;
  resource: string;
  event: string;
  delivery_url: string;
  secret?: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
}

// Опции для создания вебхука
export interface CreateWebhookOptions {
  /** Название вебхука */
  name: string;
  
  /** Тема вебхука (какое событие отслеживать) */
  topic: WebhookTopic;
  
  /** URL для доставки вебхука */
  delivery_url: string;
  
  /** Секретный ключ для подписи вебхука */
  secret?: string;
  
  /** Статус вебхука (активен/неактивен) */
  status?: 'active' | 'paused' | 'disabled';
}

/**
 * Класс для управления вебхуками WooCommerce
 */
export class WebhookManager {
  private wooClient;
  private secret: string;
  
  /**
   * Создать менеджер вебхуков
   * @param config Конфигурация WooCommerce API
   * @param secret Секретный ключ для проверки подписи вебхуков
   */
  constructor(config: WooCommerceConfig, secret?: string) {
    this.wooClient = createWooCommerceClient(config);
    this.secret = secret || process.env.WEBHOOK_SECRET || 'default-secret-key';
  }
  
  /**
   * Получить список всех вебхуков
   * @param params Параметры запроса
   * @returns Список вебхуков
   */
  async listWebhooks(params: any = {}) {
    try {
      const response = await this.wooClient.get('webhooks', params);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка вебхуков:', error);
      throw error;
    }
  }
  
  /**
   * Получить информацию о конкретном вебхуке
   * @param id ID вебхука
   * @returns Информация о вебхуке
   */
  async getWebhook(id: number) {
    try {
      const response = await this.wooClient.get(`webhooks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении информации о вебхуке #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Создать новый вебхук
   * @param options Опции для создания вебхука
   * @returns Созданный вебхук
   */
  async createWebhook(options: CreateWebhookOptions) {
    try {
      const webhookData = {
        name: options.name,
        topic: options.topic,
        delivery_url: options.delivery_url,
        secret: options.secret || this.secret,
        status: options.status || 'active'
      };
      
      const response = await this.wooClient.post('webhooks', webhookData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании вебхука:', error);
      throw error;
    }
  }
  
  /**
   * Обновить существующий вебхук
   * @param id ID вебхука
   * @param options Опции для обновления вебхука
   * @returns Обновленный вебхук
   */
  async updateWebhook(id: number, options: Partial<CreateWebhookOptions>) {
    try {
      const response = await this.wooClient.put(`webhooks/${id}`, options);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении вебхука #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Удалить вебхук
   * @param id ID вебхука
   * @param force Принудительное удаление
   * @returns Результат удаления
   */
  async deleteWebhook(id: number, force: boolean = false) {
    try {
      const response = await this.wooClient.delete(`webhooks/${id}`, { force });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении вебхука #${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Проверить подпись вебхука
   * @param signature Подпись из заголовка X-WC-Webhook-Signature
   * @param payload JSON-строка тела запроса
   * @param secret Секретный ключ (если не задан, используется ключ из конструктора)
   * @returns true, если подпись верна
   */
  verifyWebhookSignature(signature: string, payload: string, secret?: string): boolean {
    const key = secret || this.secret;
    const hmac = crypto.createHmac('sha256', key);
    const digest = hmac.update(payload).digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }
  
  /**
   * Настроить стандартные вебхуки для Task Master
   * @param baseUrl Базовый URL для вебхуков (например, https://your-task-master.com/api/webhooks)
   * @returns Созданные вебхуки
   */
  async setupTaskMasterWebhooks(baseUrl: string) {
    const webhooks = [];
    
    // Создаем вебхуки для основных событий
    const topics = [
      { topic: WebhookTopic.ORDER_CREATED, path: '/orders/created' },
      { topic: WebhookTopic.ORDER_UPDATED, path: '/orders/updated' },
      { topic: WebhookTopic.PRODUCT_UPDATED, path: '/products/updated' },
      { topic: WebhookTopic.CUSTOMER_CREATED, path: '/customers/created' }
    ];
    
    for (const { topic, path } of topics) {
      const webhook = await this.createWebhook({
        name: `Task Master - ${topic}`,
        topic: topic,
        delivery_url: `${baseUrl}${path}`
      });
      
      webhooks.push(webhook);
    }
    
    return webhooks;
  }
}

// Функция для обработки вебхука
export function createWebhookHandler(secret: string) {
  return (req: any, res: any) => {
    const signature = req.headers['x-wc-webhook-signature'];
    
    // Если нет подписи, отклоняем запрос
    if (!signature) {
      console.error('Получен вебхук без подписи');
      return res.status(401).json({ error: 'Missing webhook signature' });
    }
    
    // Получаем тело запроса
    const payload = JSON.stringify(req.body);
    
    // Проверяем подпись
    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(payload).digest('base64');
      
      if (signature !== digest) {
        console.error('Недействительная подпись вебхука');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
      
      // Обрабатываем вебхук по его теме
      const topic = req.headers['x-wc-webhook-topic'];
      const event = {
        topic,
        data: req.body
      };
      
      // Здесь можно добавить ваш код для обработки вебхука
      // и распределения его по соответствующим обработчикам
      
      console.log(`Получен вебхук: ${topic}`);
      
      // Возвращаем успешный ответ
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Ошибка при обработке вебхука:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Экспорт по умолчанию для упрощения использования
export default WebhookManager;
