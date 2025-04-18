import axios, { AxiosInstance } from 'axios';
import { createRetryableFunction, retryChecks } from './retry';

/**
 * Интерфейс для конфигурации Task Master API
 */
export interface TaskMasterConfig {
  /** URL API Task Master */
  url: string;
  
  /** API-ключ для аутентификации */
  apiKey: string;
}

/**
 * Статусы задач в Task Master
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED'
}

/**
 * Приоритеты задач в Task Master
 */
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

/**
 * Типы WooCommerce ссылок в Task Master
 */
export enum WooReferenceType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  CUSTOMER = 'CUSTOMER',
  NONE = 'NONE'
}

/**
 * Интерфейс для данных задачи
 */
export interface TaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
  tags?: string[];
  estimatedTime?: number;
  wooReference?: {
    type: WooReferenceType;
    referenceId: string;
    data?: any;
  };
}

/**
 * Класс-адаптер для работы с API Task Master
 */
export class TaskMasterAdapter {
  private client: AxiosInstance;
  
  /**
   * Создать адаптер для Task Master
   * @param config Конфигурация Task Master API
   */
  constructor(config: TaskMasterConfig) {
    this.client = axios.create({
      baseURL: config.url,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * Получить список проектов
   * @param params Параметры запроса
   * @returns Список проектов
   */
  async getProjects(params: any = {}) {
    try {
      const response = await this.client.get('/api/projects', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка проектов:', error);
      throw error;
    }
  }
  
  /**
   * Найти проект по ID
   * @param projectId ID проекта
   * @returns Информация о проекте
   */
  async getProject(projectId: string) {
    try {
      const response = await this.client.get(`/api/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении информации о проекте ${projectId}:`, error);
      throw error;
    }
  }
  
  /**
   * Получить список задач
   * @param params Параметры запроса
   * @returns Список задач
   */
  async getTasks(params: any = {}) {
    try {
      const response = await this.client.get('/api/tasks', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка задач:', error);
      throw error;
    }
  }
  
  /**
   * Найти задачу по ID
   * @param taskId ID задачи
   * @returns Информация о задаче
   */
  async getTask(taskId: string) {
    try {
      const response = await this.client.get(`/api/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении информации о задаче ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Создать новую задачу
   * @param taskData Данные задачи
   * @returns Созданная задача
   */
  async createTask(taskData: TaskData) {
    try {
      const response = await this.client.post('/api/tasks', taskData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      throw error;
    }
  }
  
  /**
   * Обновить существующую задачу
   * @param taskId ID задачи
   * @param taskData Данные для обновления задачи
   * @returns Обновленная задача
   */
  async updateTask(taskId: string, taskData: Partial<TaskData>) {
    try {
      const response = await this.client.put(`/api/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении задачи ${taskId}:`, error);
      throw error;
    }
  }
  
  /**
   * Найти задачу по WooCommerce-ссылке
   * @param referenceType Тип ссылки
   * @param referenceId ID объекта WooCommerce
   * @returns Задача или null, если не найдена
   */
  async findTaskByWooReference(referenceType: WooReferenceType, referenceId: string) {
    try {
      const response = await this.client.get('/api/tasks', {
        params: {
          'wooReference.type': referenceType,
          'wooReference.referenceId': referenceId
        }
      });
      
      const tasks = response.data.items || [];
      return tasks.length > 0 ? tasks[0] : null;
    } catch (error) {
      console.error(`Ошибка при поиске задачи по ссылке ${referenceType}:${referenceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Преобразовать заказ WooCommerce в задачу Task Master
   * @param order Данные заказа WooCommerce
   * @param projectId ID проекта Task Master
   * @returns Данные задачи
   */
  transformOrderToTask(order: any, projectId: string): TaskData {
    // Формируем название задачи
    const title = `Заказ #${order.id} - ${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`;
    
    // Формируем описание задачи
    let description = `**Данные заказа №${order.id}**\n\n`;
    description += `**Дата:** ${new Date(order.date_created).toLocaleString()}\n`;
    description += `**Статус:** ${order.status}\n`;
    description += `**Сумма:** ${order.total} ${order.currency}\n\n`;
    
    // Добавляем информацию о клиенте
    description += `**Клиент:**\n`;
    description += `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}\n`;
    description += `Email: ${order.billing?.email || 'Не указан'}\n`;
    description += `Телефон: ${order.billing?.phone || 'Не указан'}\n\n`;
    
    // Добавляем информацию о товарах
    description += `**Товары:**\n`;
    (order.line_items || []).forEach((item: any) => {
      description += `- ${item.name} (${item.quantity} шт.) - ${item.total} ${order.currency}\n`;
    });
    
    // Определяем приоритет задачи на основе статуса заказа и суммы
    let priority = TaskPriority.MEDIUM;
    if (order.status === 'processing' || order.status === 'on-hold') {
      priority = TaskPriority.HIGH;
    }
    
    // Определяем статус задачи на основе статуса заказа
    let status = TaskStatus.TODO;
    switch (order.status) {
      case 'pending':
        status = TaskStatus.TODO;
        break;
      case 'processing':
        status = TaskStatus.IN_PROGRESS;
        break;
      case 'on-hold':
        status = TaskStatus.BLOCKED;
        break;
      case 'completed':
        status = TaskStatus.COMPLETED;
        break;
      default:
        status = TaskStatus.TODO;
    }
    
    // Формируем теги
    const tags = ['заказ', order.status];
    if (order.payment_method) {
      tags.push(`оплата:${order.payment_method}`);
    }
    
    return {
      title,
      description,
      status,
      priority,
      projectId,
      tags,
      wooReference: {
        type: WooReferenceType.ORDER,
        referenceId: order.id.toString(),
        data: order
      }
    };
  }
  
  /**
   * Создать или обновить задачу на основе заказа WooCommerce
   * @param order Данные заказа WooCommerce
   * @param projectId ID проекта Task Master
   * @returns Созданная или обновленная задача
   */
  async syncOrderTask(order: any, projectId: string) {
    try {
      // Преобразуем заказ в данные задачи
      const taskData = this.transformOrderToTask(order, projectId);
      
      // Ищем существующую задачу по ссылке на заказ
      const existingTask = await this.findTaskByWooReference(
        WooReferenceType.ORDER, 
        order.id.toString()
      );
      
      if (existingTask) {
        // Обновляем существующую задачу
        return await this.updateTask(existingTask.id, taskData);
      } else {
        // Создаем новую задачу
        return await this.createTask(taskData);
      }
    } catch (error) {
      console.error(`Ошибка при синхронизации задачи для заказа #${order.id}:`, error);
      throw error;
    }
  }
}

// Создаем версию адаптера с повторными попытками для ненадежных сетей
export function createTaskMasterAdapter(config: TaskMasterConfig): TaskMasterAdapter {
  const adapter = new TaskMasterAdapter(config);
  
  // Оборачиваем методы с автоматическими повторными попытками
  const retryOptions = {
    maxRetries: 3,
    initialDelay: 500,
    shouldRetry: retryChecks.isTransientError
  };
  
  // Применяем повторные попытки к методам, которые могут быть ненадежными
  adapter.createTask = createRetryableFunction(adapter.createTask.bind(adapter), retryOptions);
  adapter.updateTask = createRetryableFunction(adapter.updateTask.bind(adapter), retryOptions);
  adapter.getTask = createRetryableFunction(adapter.getTask.bind(adapter), retryOptions);
  adapter.getTasks = createRetryableFunction(adapter.getTasks.bind(adapter), retryOptions);
  
  return adapter;
}

export default TaskMasterAdapter;
