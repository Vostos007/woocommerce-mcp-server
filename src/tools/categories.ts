import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';

/**
 * Создает инструменты для работы с категориями товаров WooCommerce
 * @param config Конфигурация WooCommerce API
 * @returns Объект с функциями для работы с категориями
 */
export const createCategoryTools = (config: any) => {
  const api = new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3'
  });

  /**
   * Получает список категорий товаров
   * @param params Параметры запроса
   * @returns Список категорий
   */
  const listProductCategories = async (params: any = {}) => {
    try {
      validateInput(params, {
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

      const cacheKey = `product_categories_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products/categories', params));
      await cacheData(cacheKey, response.data, 60); // Кэш на 60 секунд
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка категорий:', error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретной категории товаров
   * @param id ID категории
   * @returns Данные категории
   */
  const getProductCategory = async (id: number) => {
    try {
      validateInput({ id }, {
        id: { type: 'number', required: true }
      });

      const cacheKey = `product_category_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`products/categories/${id}`));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении категории с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Создает новую категорию товаров
   * @param categoryData Данные категории
   * @returns Созданная категория
   */
  const createProductCategory = async (categoryData: any) => {
    try {
      validateInput(categoryData, {
        name: { type: 'string', required: true },
        slug: { type: 'string', optional: true },
        parent: { type: 'number', optional: true },
        description: { type: 'string', optional: true },
        display: { type: 'string', enum: ['default', 'products', 'subcategories', 'both'], optional: true },
        image: { type: 'object', optional: true }
      });

      const response = await retryOperation(() => api.post('products/categories', categoryData));
      
      // Инвалидация кэша
      await cacheData('product_categories_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      throw error;
    }
  };

  /**
   * Обновляет существующую категорию товаров
   * @param id ID категории
   * @param categoryData Данные для обновления
   * @returns Обновленная категория
   */
  const updateProductCategory = async (id: number, categoryData: any) => {
    try {
      validateInput({ id, ...categoryData }, {
        id: { type: 'number', required: true },
        name: { type: 'string', optional: true },
        slug: { type: 'string', optional: true },
        parent: { type: 'number', optional: true },
        description: { type: 'string', optional: true },
        display: { type: 'string', enum: ['default', 'products', 'subcategories', 'both'], optional: true },
        image: { type: 'object', optional: true }
      });

      const response = await retryOperation(() => api.put(`products/categories/${id}`, categoryData));
      
      // Инвалидация кэша
      await cacheData(`product_category_${id}`, null, 0);
      await cacheData('product_categories_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении категории с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет категорию товаров
   * @param id ID категории
   * @param force Принудительное удаление
   * @returns Результат операции
   */
  const deleteProductCategory = async (id: number, force: boolean = false) => {
    try {
      validateInput({ id, force }, {
        id: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.delete(`products/categories/${id}`, { force }));
      
      // Инвалидация кэша
      await cacheData(`product_category_${id}`, null, 0);
      await cacheData('product_categories_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении категории с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Получает товары из определенной категории
   * @param categoryId ID категории
   * @param params Дополнительные параметры запроса
   * @returns Список товаров в категории
   */
  const getProductsByCategory = async (categoryId: number, params: any = {}) => {
    try {
      validateInput({ categoryId, ...params }, {
        categoryId: { type: 'number', required: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true },
        status: { type: 'string', optional: true },
        featured: { type: 'boolean', optional: true }
      });

      const queryParams = {
        ...params,
        category: categoryId
      };

      const cacheKey = `products_by_category_${categoryId}_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('products', queryParams));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении товаров категории с ID ${categoryId}:`, error);
      throw error;
    }
  };

  /**
   * Получает полную иерархию категорий
   * @returns Иерархически организованный список категорий
   */
  const getCategoryHierarchy = async () => {
    try {
      // Получаем все категории
      const allCategories = await listProductCategories({ per_page: 100 });
      
      // Строим иерархию
      const categoryMap: Record<number, any> = {};
      const rootCategories: any[] = [];
      
      // Первый проход: создаем map категорий по ID
      allCategories.forEach((category: any) => {
        categoryMap[category.id] = {
          ...category,
          children: []
        };
      });
      
      // Второй проход: строим иерархию
      allCategories.forEach((category: any) => {
        if (category.parent === 0) {
          // Корневая категория
          rootCategories.push(categoryMap[category.id]);
        } else if (categoryMap[category.parent]) {
          // Дочерняя категория
          categoryMap[category.parent].children.push(categoryMap[category.id]);
        }
      });
      
      return rootCategories;
    } catch (error) {
      console.error('Ошибка при получении иерархии категорий:', error);
      throw error;
    }
  };

  /**
   * Назначает категорию товару
   * @param productId ID товара
   * @param categoryIds Массив ID категорий
   * @returns Обновленный товар
   */
  const assignCategoriesToProduct = async (productId: number, categoryIds: number[]) => {
    try {
      validateInput({ productId, categoryIds }, {
        productId: { type: 'number', required: true },
        categoryIds: { type: 'array', required: true }
      });

      // Получаем текущие данные товара
      const product = await retryOperation(() => api.get(`products/${productId}`));
      
      // Обновляем товар с новыми категориями
      const response = await retryOperation(() => api.put(`products/${productId}`, {
        categories: categoryIds.map(id => ({ id }))
      }));

      return response.data;
    } catch (error) {
      console.error(`Ошибка при назначении категорий товару с ID ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Создает несколько категорий за один запрос
   * @param categories Массив объектов с данными категорий
   * @returns Массив созданных категорий
   */
  const createBulkCategories = async (categories: any[]) => {
    try {
      validateInput({ categories }, {
        categories: { type: 'array', required: true }
      });

      // Поскольку WooCommerce API не поддерживает массовое создание категорий,
      // создаем категории по одной, но возвращаем общий результат
      const createdCategories = [];
      
      for (const category of categories) {
        validateInput(category, {
          name: { type: 'string', required: true },
          slug: { type: 'string', optional: true },
          parent: { type: 'number', optional: true },
          description: { type: 'string', optional: true }
        });
        
        const createdCategory = await createProductCategory(category);
        createdCategories.push(createdCategory);
      }
      
      return createdCategories;
    } catch (error) {
      console.error('Ошибка при массовом создании категорий:', error);
      throw error;
    }
  };

  /**
   * Получает категории с указанными фильтрами
   * @param filters Объект с фильтрами
   * @returns Отфильтрованный список категорий
   */
  const getFilteredCategories = async (filters: any = {}) => {
    try {
      const validFilters: Record<string, any> = {};
      
      // Проверяем и добавляем допустимые фильтры
      if (filters.search) validFilters.search = filters.search;
      if (filters.parent !== undefined) validFilters.parent = filters.parent;
      if (filters.hide_empty !== undefined) validFilters.hide_empty = filters.hide_empty;
      if (filters.include) validFilters.include = filters.include;
      if (filters.exclude) validFilters.exclude = filters.exclude;
      if (filters.orderby) validFilters.orderby = filters.orderby;
      if (filters.order) validFilters.order = filters.order;
      
      return await listProductCategories(validFilters);
    } catch (error) {
      console.error('Ошибка при получении отфильтрованных категорий:', error);
      throw error;
    }
  };

  return {
    listProductCategories,
    getProductCategory,
    createProductCategory,
    updateProductCategory,
    deleteProductCategory,
    getProductsByCategory,
    getCategoryHierarchy,
    assignCategoriesToProduct,
    createBulkCategories,
    getFilteredCategories
  };
};

export default createCategoryTools;
