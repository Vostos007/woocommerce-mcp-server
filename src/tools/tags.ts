import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';

/**
 * Создает инструменты для работы с тегами WooCommerce
 * @param config Конфигурация WooCommerce API
 * @returns Объект с функциями для работы с тегами
 */
export const createTagTools = (config: any) => {
  const api = new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3'
  });

  /**
   * Получает список тегов товаров
   * @param params Параметры запроса
   * @returns Список тегов
   */
  const listProductTags = async (params: any = {}) => {
    try {
      validateInput(params, {
        context: { type: 'string', enum: ['view', 'edit'], optional: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        search: { type: 'string', optional: true },
        exclude: { type: 'array', optional: true },
        include: { type: 'array', optional: true },
        offset: { type: 'number', optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true },
        hide_empty: { type: 'boolean', optional: true },
        product: { type: 'number', optional: true },
        slug: { type: 'string', optional: true }
      });

      const cacheKey = `product_tags_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products/tags', params));
      await cacheData(cacheKey, response.data, 60); // Кэш на 60 секунд
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка тегов:', error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретном теге товара
   * @param id ID тега
   * @returns Данные тега
   */
  const getProductTag = async (id: number) => {
    try {
      validateInput({ id }, {
        id: { type: 'number', required: true }
      });

      const cacheKey = `product_tag_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`products/tags/${id}`));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении тега с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Создает новый тег товара
   * @param tagData Данные тега
   * @returns Созданный тег
   */
  const createProductTag = async (tagData: any) => {
    try {
      validateInput(tagData, {
        name: { type: 'string', required: true },
        slug: { type: 'string', optional: true },
        description: { type: 'string', optional: true }
      });

      const response = await retryOperation(() => api.post('products/tags', tagData));
      
      // Инвалидация кэша
      await cacheData('product_tags_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании тега:', error);
      throw error;
    }
  };

  /**
   * Обновляет существующий тег товара
   * @param id ID тега
   * @param tagData Данные для обновления
   * @returns Обновленный тег
   */
  const updateProductTag = async (id: number, tagData: any) => {
    try {
      validateInput({ id, ...tagData }, {
        id: { type: 'number', required: true },
        name: { type: 'string', optional: true },
        slug: { type: 'string', optional: true },
        description: { type: 'string', optional: true }
      });

      const response = await retryOperation(() => api.put(`products/tags/${id}`, tagData));
      
      // Инвалидация кэша
      await cacheData(`product_tag_${id}`, null, 0);
      await cacheData('product_tags_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении тега с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет тег товара
   * @param id ID тега
   * @param force Принудительное удаление
   * @returns Результат операции
   */
  const deleteProductTag = async (id: number, force: boolean = false) => {
    try {
      validateInput({ id, force }, {
        id: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.delete(`products/tags/${id}`, { force }));
      
      // Инвалидация кэша
      await cacheData(`product_tag_${id}`, null, 0);
      await cacheData('product_tags_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении тега с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Назначает теги товару
   * @param productId ID товара
   * @param tagIds Массив ID тегов
   * @returns Обновленный товар
   */
  const assignTagsToProduct = async (productId: number, tagIds: number[]) => {
    try {
      validateInput({ productId, tagIds }, {
        productId: { type: 'number', required: true },
        tagIds: { type: 'array', required: true }
      });

      // Получаем текущие данные товара
      const product = await retryOperation(() => api.get(`products/${productId}`));
      
      // Обновляем товар с новыми тегами
      const response = await retryOperation(() => api.put(`products/${productId}`, {
        tags: tagIds.map(id => ({ id }))
      }));

      return response.data;
    } catch (error) {
      console.error(`Ошибка при назначении тегов товару с ID ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Получает товары с определенным тегом
   * @param tagId ID тега
   * @param params Дополнительные параметры запроса
   * @returns Список товаров с указанным тегом
   */
  const getProductsByTag = async (tagId: number, params: any = {}) => {
    try {
      validateInput({ tagId, ...params }, {
        tagId: { type: 'number', required: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        status: { type: 'string', optional: true },
        featured: { type: 'boolean', optional: true },
        sku: { type: 'string', optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true }
      });

      const queryParams = {
        ...params,
        tag: tagId
      };

      const cacheKey = `products_by_tag_${tagId}_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products', queryParams));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении товаров с тегом ID ${tagId}:`, error);
      throw error;
    }
  };

  /**
   * Создает несколько тегов за один запрос
   * @param tags Массив объектов с данными тегов
   * @returns Массив созданных тегов
   */
  const createBulkTags = async (tags: any[]) => {
    try {
      validateInput({ tags }, {
        tags: { type: 'array', required: true }
      });

      // Поскольку WooCommerce API не поддерживает массовое создание тегов,
      // создаем теги по одному, но возвращаем общий результат
      const createdTags = [];
      
      for (const tag of tags) {
        validateInput(tag, {
          name: { type: 'string', required: true },
          slug: { type: 'string', optional: true },
          description: { type: 'string', optional: true }
        });
        
        const createdTag = await createProductTag(tag);
        createdTags.push(createdTag);
      }
      
      return createdTags;
    } catch (error) {
      console.error('Ошибка при массовом создании тегов:', error);
      throw error;
    }
  };

  /**
   * Ищет теги по имени или части имени
   * @param query Поисковый запрос
   * @param params Дополнительные параметры запроса
   * @returns Список найденных тегов
   */
  const searchProductTags = async (query: string, params: any = {}) => {
    try {
      validateInput({ query, ...params }, {
        query: { type: 'string', required: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true }
      });

      const searchParams = {
        ...params,
        search: query
      };

      const cacheKey = `product_tags_search_${query}_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products/tags', searchParams));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при поиске тегов с запросом "${query}":`, error);
      throw error;
    }
  };

  return {
    listProductTags,
    getProductTag,
    createProductTag,
    updateProductTag,
    deleteProductTag,
    assignTagsToProduct,
    getProductsByTag,
    createBulkTags,
    searchProductTags
  };
};

export default createTagTools;
