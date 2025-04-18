import { WooCommerceConfig } from '../types/woocommerce';
import { createWooCommerceClient } from '../utils/woocommerce';

/**
 * Создает набор инструментов для работы с клиентами
 * @param config Конфигурация WooCommerce API
 */
export function createCustomerTools(config: WooCommerceConfig) {
  const wooClient = createWooCommerceClient(config);

  return {
    /**
     * Получить список клиентов
     * @param params Параметры запроса
     */
    async listCustomers(params: any = {}) {
      try {
        const response = await wooClient.get('customers', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка клиентов:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретном клиенте
     * @param id ID клиента
     */
    async getCustomer(id: number) {
      try {
        const response = await wooClient.get(`customers/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о клиенте #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать нового клиента
     * @param customerData Данные клиента
     */
    async createCustomer(customerData: any) {
      try {
        const response = await wooClient.post('customers', customerData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании клиента:', error);
        throw error;
      }
    },

    /**
     * Обновить существующего клиента
     * @param id ID клиента
     * @param customerData Данные для обновления
     */
    async updateCustomer(id: number, customerData: any) {
      try {
        const response = await wooClient.put(`customers/${id}`, customerData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении клиента #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить клиента
     * @param id ID клиента
     * @param force Принудительное удаление
     */
    async deleteCustomer(id: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`customers/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении клиента #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить заказы клиента
     * @param customerId ID клиента
     * @param params Параметры запроса
     */
    async getCustomerOrders(customerId: number, params: any = {}) {
      try {
        // Нужно использовать эндпоинт orders с фильтром по customer
        const orderParams = {
          ...params,
          customer: customerId
        };
        const response = await wooClient.get('orders', orderParams);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении заказов клиента #${customerId}:`, error);
        throw error;
      }
    },

    /**
     * Поиск клиентов по email
     * @param email Email для поиска
     */
    async findCustomerByEmail(email: string) {
      try {
        const response = await wooClient.get('customers', { email });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при поиске клиента по email ${email}:`, error);
        throw error;
      }
    },

    /**
     * Обновить метаданные клиента
     * @param customerId ID клиента
     * @param metaData Массив метаданных [{key: string, value: any}]
     */
    async updateCustomerMetadata(customerId: number, metaData: Array<{key: string, value: any}>) {
      try {
        const response = await wooClient.put(`customers/${customerId}`, { meta_data: metaData });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении метаданных клиента #${customerId}:`, error);
        throw error;
      }
    },

    /**
     * Получить общее количество заказов клиента
     * @param customerId ID клиента
     */
    async getCustomerOrderCount(customerId: number) {
      try {
        const orders = await this.getCustomerOrders(customerId, { per_page: 1 });
        return orders.headers['x-wp-total'] || 0;
      } catch (error) {
        console.error(`Ошибка при получении количества заказов клиента #${customerId}:`, error);
        throw error;
      }
    },

    /**
     * Получить общую сумму покупок клиента
     * @param customerId ID клиента
     */
    async getCustomerTotalSpent(customerId: number) {
      try {
        // Получаем все заказы клиента со статусом "completed"
        const orders = await this.getCustomerOrders(customerId, { status: 'completed', per_page: 100 });
        
        // Суммируем общую сумму заказов
        const totalSpent = orders.data.reduce((total: number, order: any) => {
          return total + parseFloat(order.total);
        }, 0);
        
        return totalSpent;
      } catch (error) {
        console.error(`Ошибка при расчете общей суммы покупок клиента #${customerId}:`, error);
        throw error;
      }
    }
  };
}
