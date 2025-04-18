import { WooCommerceConfig } from '../types/woocommerce';
import { createWooCommerceClient } from '../utils/woocommerce';

/**
 * Создает набор инструментов для работы с товарами
 * @param config Конфигурация WooCommerce API
 */
export function createProductTools(config: WooCommerceConfig) {
  const wooClient = createWooCommerceClient(config);

  return {
    /**
     * Получить список товаров
     * @param params Параметры запроса
     */
    async listProducts(params: any = {}) {
      try {
        const response = await wooClient.get('products', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка товаров:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретном товаре
     * @param id ID товара
     */
    async getProduct(id: number) {
      try {
        const response = await wooClient.get(`products/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о товаре #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новый товар
     * @param productData Данные товара
     */
    async createProduct(productData: any) {
      try {
        const response = await wooClient.post('products', productData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании товара:', error);
        throw error;
      }
    },

    /**
     * Обновить существующий товар
     * @param id ID товара
     * @param productData Данные для обновления
     */
    async updateProduct(id: number, productData: any) {
      try {
        const response = await wooClient.put(`products/${id}`, productData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении товара #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить товар
     * @param id ID товара
     * @param force Принудительное удаление без корзины
     */
    async deleteProduct(id: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`products/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении товара #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список категорий товаров
     * @param params Параметры запроса
     */
    async listProductCategories(params: any = {}) {
      try {
        const response = await wooClient.get('products/categories', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка категорий товаров:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретной категории товаров
     * @param id ID категории
     */
    async getProductCategory(id: number) {
      try {
        const response = await wooClient.get(`products/categories/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новую категорию товаров
     * @param categoryData Данные категории
     */
    async createProductCategory(categoryData: any) {
      try {
        const response = await wooClient.post('products/categories', categoryData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании категории товаров:', error);
        throw error;
      }
    },

    /**
     * Обновить существующую категорию товаров
     * @param id ID категории
     * @param categoryData Данные для обновления
     */
    async updateProductCategory(id: number, categoryData: any) {
      try {
        const response = await wooClient.put(`products/categories/${id}`, categoryData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить категорию товаров
     * @param id ID категории
     * @param force Принудительное удаление
     */
    async deleteProductCategory(id: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`products/categories/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список вариаций товара
     * @param productId ID товара
     * @param params Параметры запроса
     */
    async listProductVariations(productId: number, params: any = {}) {
      try {
        const response = await wooClient.get(`products/${productId}/variations`, params);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении списка вариаций товара #${productId}:`, error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретной вариации товара
     * @param productId ID товара
     * @param variationId ID вариации
     */
    async getProductVariation(productId: number, variationId: number) {
      try {
        const response = await wooClient.get(`products/${productId}/variations/${variationId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о вариации #${variationId} товара #${productId}:`, error);
        throw error;
      }
    },

    /**
     * Создать новую вариацию товара
     * @param productId ID товара
     * @param variationData Данные вариации
     */
    async createProductVariation(productId: number, variationData: any) {
      try {
        const response = await wooClient.post(`products/${productId}/variations`, variationData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при создании вариации товара #${productId}:`, error);
        throw error;
      }
    },

    /**
     * Обновить существующую вариацию товара
     * @param productId ID товара
     * @param variationId ID вариации
     * @param variationData Данные для обновления
     */
    async updateProductVariation(productId: number, variationId: number, variationData: any) {
      try {
        const response = await wooClient.put(`products/${productId}/variations/${variationId}`, variationData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении вариации #${variationId} товара #${productId}:`, error);
        throw error;
      }
    },

    /**
     * Удалить вариацию товара
     * @param productId ID товара
     * @param variationId ID вариации
     * @param force Принудительное удаление
     */
    async deleteProductVariation(productId: number, variationId: number, force: boolean = false) {
      try {
        const response = await wooClient.delete(`products/${productId}/variations/${variationId}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении вариации #${variationId} товара #${productId}:`, error);
        throw error;
      }
    }
  };
}
