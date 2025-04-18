import { WooCommerceConfig } from '../types/woocommerce';
import { createWooCommerceClient } from '../utils/woocommerce';

/**
 * Создает набор инструментов для работы с заказами
 * @param config Конфигурация WooCommerce API
 */
export function createOrderTools(config: WooCommerceConfig) {
  const wooClient = createWooCommerceClient(config);

  return {
    /**
     * Получить список заказов
     * @param params Параметры запроса
     */
    async listOrders(params: any = {}) {
      try {
        const response = await wooClient.get('orders', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка заказов:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретном заказе
     * @param id ID заказа
     */
    async getOrder(id: number) {
      try {
        const response = await wooClient.get(`orders/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о заказе #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новый заказ
     * @param orderData Данные заказа
     */
    async createOrder(orderData: any) {
      try {
        const response = await wooClient.post('orders', orderData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании заказа:', error);
        throw error;
      }
    },

    /**
     * Обновить существующий заказ
     * @param id ID заказа
     * @param orderData Данные для обновления
     */
    async updateOrder(id: number, orderData: any) {
      try {
        const response = await wooClient.put(`orders/${id}`, orderData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении заказа #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить заказ
     * @param id ID заказа
     * @param force Принудительное удаление
     */
    async deleteOrder(id: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`orders/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении заказа #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список заметок к заказу
     * @param orderId ID заказа
     * @param params Параметры запроса
     */
    async listOrderNotes(orderId: number, params: any = {}) {
      try {
        const response = await wooClient.get(`orders/${orderId}/notes`, params);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении заметок к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Получить конкретную заметку к заказу
     * @param orderId ID заказа
     * @param noteId ID заметки
     */
    async getOrderNote(orderId: number, noteId: number) {
      try {
        const response = await wooClient.get(`orders/${orderId}/notes/${noteId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении заметки #${noteId} к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Создать заметку к заказу
     * @param orderId ID заказа
     * @param noteData Данные заметки
     */
    async createOrderNote(orderId: number, noteData: any) {
      try {
        const response = await wooClient.post(`orders/${orderId}/notes`, noteData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при создании заметки к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Удалить заметку к заказу
     * @param orderId ID заказа
     * @param noteId ID заметки
     * @param force Принудительное удаление
     */
    async deleteOrderNote(orderId: number, noteId: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`orders/${orderId}/notes/${noteId}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении заметки #${noteId} к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Получить список возвратов к заказу
     * @param orderId ID заказа
     * @param params Параметры запроса
     */
    async listOrderRefunds(orderId: number, params: any = {}) {
      try {
        const response = await wooClient.get(`orders/${orderId}/refunds`, params);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении списка возвратов к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Получить конкретный возврат к заказу
     * @param orderId ID заказа
     * @param refundId ID возврата
     */
    async getOrderRefund(orderId: number, refundId: number) {
      try {
        const response = await wooClient.get(`orders/${orderId}/refunds/${refundId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении возврата #${refundId} к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Создать возврат к заказу
     * @param orderId ID заказа
     * @param refundData Данные возврата
     */
    async createOrderRefund(orderId: number, refundData: any) {
      try {
        const response = await wooClient.post(`orders/${orderId}/refunds`, refundData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при создании возврата к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Удалить возврат к заказу
     * @param orderId ID заказа
     * @param refundId ID возврата
     * @param force Принудительное удаление
     */
    async deleteOrderRefund(orderId: number, refundId: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`orders/${orderId}/refunds/${refundId}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении возврата #${refundId} к заказу #${orderId}:`, error);
        throw error;
      }
    },

    /**
     * Обновить статус заказа
     * @param orderId ID заказа
     * @param status Новый статус
     */
    async updateOrderStatus(orderId: number, status: string) {
      try {
        const response = await wooClient.put(`orders/${orderId}`, { status });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении статуса заказа #${orderId}:`, error);
        throw error;
      }
    }
  };
}
