import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';

/**
 * Создает инструменты для работы с атрибутами товаров WooCommerce
 * @param config Конфигурация WooCommerce API
 * @returns Объект с функциями для работы с атрибутами
 */
export const createAttributeTools = (config: any) => {
  const api = new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3'
  });

  /**
   * Получает список всех атрибутов товаров
   * @param params Параметры запроса
   * @returns Список атрибутов
   */
  const listProductAttributes = async (params: any = {}) => {
    try {
      validateInput(params, {
        context: { type: 'string', enum: ['view', 'edit'], optional: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true }
      });

      const cacheKey = `product_attributes_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products/attributes', params));
      await cacheData(cacheKey, response.data, 60); // Кэш на 60 секунд
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка атрибутов:', error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретном атрибуте товара
   * @param id ID атрибута
   * @returns Данные атрибута
   */
  const getProductAttribute = async (id: number) => {
    try {
      validateInput({ id }, {
        id: { type: 'number', required: true }
      });

      const cacheKey = `product_attribute_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`products/attributes/${id}`));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении атрибута с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Создает новый атрибут товара
   * @param attributeData Данные атрибута
   * @returns Созданный атрибут
   */
  const createProductAttribute = async (attributeData: any) => {
    try {
      validateInput(attributeData, {
        name: { type: 'string', required: true },
        slug: { type: 'string', optional: true },
        type: { type: 'string', enum: ['select', 'text', 'color', 'button', 'radio'], optional: true },
        order_by: { type: 'string', enum: ['menu_order', 'name', 'name_num', 'id'], optional: true },
        has_archives: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.post('products/attributes', attributeData));
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании атрибута:', error);
      throw error;
    }
  };

  /**
   * Обновляет существующий атрибут товара
   * @param id ID атрибута
   * @param attributeData Данные для обновления
   * @returns Обновленный атрибут
   */
  const updateProductAttribute = async (id: number, attributeData: any) => {
    try {
      validateInput({ id, ...attributeData }, {
        id: { type: 'number', required: true },
        name: { type: 'string', optional: true },
        slug: { type: 'string', optional: true },
        type: { type: 'string', enum: ['select', 'text', 'color', 'button', 'radio'], optional: true },
        order_by: { type: 'string', enum: ['menu_order', 'name', 'name_num', 'id'], optional: true },
        has_archives: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.put(`products/attributes/${id}`, attributeData));
      
      // Инвалидация кэша
      await cacheData(`product_attribute_${id}`, null, 0);
      await cacheData('product_attributes_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении атрибута с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет атрибут товара
   * @param id ID атрибута
   * @param force Принудительное удаление
   * @returns Результат операции
   */
  const deleteProductAttribute = async (id: number, force: boolean = false) => {
    try {
      validateInput({ id, force }, {
        id: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.delete(`products/attributes/${id}`, { force }));
      
      // Инвалидация кэша
      await cacheData(`product_attribute_${id}`, null, 0);
      await cacheData('product_attributes_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении атрибута с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Получает список всех терминов атрибута
   * @param attributeId ID атрибута
   * @param params Параметры запроса
   * @returns Список терминов атрибута
   */
  const listAttributeTerms = async (attributeId: number, params: any = {}) => {
    try {
      validateInput({ attributeId, ...params }, {
        attributeId: { type: 'number', required: true },
        context: { type: 'string', enum: ['view', 'edit'], optional: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        search: { type: 'string', optional: true },
        exclude: { type: 'array', optional: true },
        include: { type: 'array', optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true },
        hide_empty: { type: 'boolean', optional: true },
        parent: { type: 'number', optional: true },
        product: { type: 'number', optional: true },
        slug: { type: 'string', optional: true }
      });

      const cacheKey = `attribute_${attributeId}_terms_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`products/attributes/${attributeId}/terms`, params));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении терминов атрибута с ID ${attributeId}:`, error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретном термине атрибута
   * @param attributeId ID атрибута
   * @param termId ID термина
   * @returns Данные термина
   */
  const getAttributeTerm = async (attributeId: number, termId: number) => {
    try {
      validateInput({ attributeId, termId }, {
        attributeId: { type: 'number', required: true },
        termId: { type: 'number', required: true }
      });

      const cacheKey = `attribute_${attributeId}_term_${termId}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`products/attributes/${attributeId}/terms/${termId}`));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении термина с ID ${termId} для атрибута с ID ${attributeId}:`, error);
      throw error;
    }
  };

  /**
   * Создает новый термин атрибута
   * @param attributeId ID атрибута
   * @param termData Данные термина
   * @returns Созданный термин
   */
  const createAttributeTerm = async (attributeId: number, termData: any) => {
    try {
      validateInput({ attributeId, ...termData }, {
        attributeId: { type: 'number', required: true },
        name: { type: 'string', required: true },
        slug: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        menu_order: { type: 'number', optional: true }
      });

      const response = await retryOperation(() => api.post(`products/attributes/${attributeId}/terms`, termData));
      
      // Инвалидация кэша
      await cacheData(`attribute_${attributeId}_terms_*`, null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при создании термина для атрибута с ID ${attributeId}:`, error);
      throw error;
    }
  };

  /**
   * Обновляет существующий термин атрибута
   * @param attributeId ID атрибута
   * @param termId ID термина
   * @param termData Данные для обновления
   * @returns Обновленный термин
   */
  const updateAttributeTerm = async (attributeId: number, termId: number, termData: any) => {
    try {
      validateInput({ attributeId, termId, ...termData }, {
        attributeId: { type: 'number', required: true },
        termId: { type: 'number', required: true },
        name: { type: 'string', optional: true },
        slug: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        menu_order: { type: 'number', optional: true }
      });

      const response = await retryOperation(() => api.put(`products/attributes/${attributeId}/terms/${termId}`, termData));
      
      // Инвалидация кэша
      await cacheData(`attribute_${attributeId}_term_${termId}`, null, 0);
      await cacheData(`attribute_${attributeId}_terms_*`, null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении термина с ID ${termId} для атрибута с ID ${attributeId}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет термин атрибута
   * @param attributeId ID атрибута
   * @param termId ID термина
   * @param force Принудительное удаление
   * @returns Результат операции
   */
  const deleteAttributeTerm = async (attributeId: number, termId: number, force: boolean = false) => {
    try {
      validateInput({ attributeId, termId, force }, {
        attributeId: { type: 'number', required: true },
        termId: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.delete(`products/attributes/${attributeId}/terms/${termId}`, { force }));
      
      // Инвалидация кэша
      await cacheData(`attribute_${attributeId}_term_${termId}`, null, 0);
      await cacheData(`attribute_${attributeId}_terms_*`, null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении термина с ID ${termId} для атрибута с ID ${attributeId}:`, error);
      throw error;
    }
  };

  /**
   * Назначает атрибут и его значения товару
   * @param productId ID товара
   * @param attributeId ID атрибута
   * @param options Значения атрибута
   * @returns Обновленный товар
   */
  const assignAttributeToProduct = async (productId: number, attributeId: number, options: string[]) => {
    try {
      validateInput({ productId, attributeId, options }, {
        productId: { type: 'number', required: true },
        attributeId: { type: 'number', required: true },
        options: { type: 'array', required: true }
      });

      // Получаем текущие данные товара
      const product = await retryOperation(() => api.get(`products/${productId}`));
      const currentAttributes = product.data.attributes || [];

      // Проверяем, есть ли уже такой атрибут
      const existingAttributeIndex = currentAttributes.findIndex(
        (attr: any) => attr.id === attributeId
      );

      if (existingAttributeIndex >= 0) {
        // Обновляем существующий атрибут
        currentAttributes[existingAttributeIndex].options = options;
      } else {
        // Добавляем новый атрибут
        currentAttributes.push({
          id: attributeId,
          options
        });
      }

      // Обновляем товар
      const response = await retryOperation(() => api.put(`products/${productId}`, {
        attributes: currentAttributes
      }));

      return response.data;
    } catch (error) {
      console.error(`Ошибка при назначении атрибута с ID ${attributeId} товару с ID ${productId}:`, error);
      throw error;
    }
  };

  return {
    listProductAttributes,
    getProductAttribute,
    createProductAttribute,
    updateProductAttribute,
    deleteProductAttribute,
    listAttributeTerms,
    getAttributeTerm,
    createAttributeTerm,
    updateAttributeTerm,
    deleteAttributeTerm,
    assignAttributeToProduct
  };
};

export default createAttributeTools;
