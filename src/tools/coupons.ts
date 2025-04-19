import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';

/**
 * Создает инструменты для работы с купонами WooCommerce
 * @param config Конфигурация WooCommerce API
 * @returns Объект с функциями для работы с купонами
 */
export const createCouponTools = (config: any) => {
  const api = new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3'
  });

  /**
   * Получает список купонов
   * @param params Параметры запроса
   * @returns Список купонов
   */
  const listCoupons = async (params: any = {}) => {
    try {
      validateInput(params, {
        context: { type: 'string', enum: ['view', 'edit'], optional: true },
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        search: { type: 'string', optional: true },
        after: { type: 'string', optional: true },
        before: { type: 'string', optional: true },
        order: { type: 'string', enum: ['asc', 'desc'], optional: true },
        orderby: { type: 'string', optional: true },
        code: { type: 'string', optional: true }
      });

      const cacheKey = `coupons_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('coupons', params));
      await cacheData(cacheKey, response.data, 60); // Кэш на 60 секунд
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка купонов:', error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретном купоне
   * @param id ID купона
   * @returns Данные купона
   */
  const getCoupon = async (id: number) => {
    try {
      validateInput({ id }, {
        id: { type: 'number', required: true }
      });

      const cacheKey = `coupon_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`coupons/${id}`));
      await cacheData(cacheKey, response.data, 60);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении купона с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Создает новый купон
   * @param couponData Данные купона
   * @returns Созданный купон
   */
  const createCoupon = async (couponData: any) => {
    try {
      validateInput(couponData, {
        code: { type: 'string', required: true },
        discount_type: { 
          type: 'string', 
          enum: ['percent', 'fixed_cart', 'fixed_product'], 
          required: true 
        },
        amount: { type: 'string', required: true },
        individual_use: { type: 'boolean', optional: true },
        exclude_sale_items: { type: 'boolean', optional: true },
        minimum_amount: { type: 'string', optional: true },
        maximum_amount: { type: 'string', optional: true },
        email_restrictions: { type: 'array', optional: true },
        usage_limit: { type: 'number', optional: true },
        usage_limit_per_user: { type: 'number', optional: true },
        limit_usage_to_x_items: { type: 'number', optional: true },
        usage_count: { type: 'number', optional: true },
        date_expires: { type: 'string', optional: true },
        free_shipping: { type: 'boolean', optional: true },
        product_ids: { type: 'array', optional: true },
        excluded_product_ids: { type: 'array', optional: true },
        product_categories: { type: 'array', optional: true },
        excluded_product_categories: { type: 'array', optional: true },
        exclude_backorder_products: { type: 'boolean', optional: true },
        exclude_products_on_sale: { type: 'boolean', optional: true },
        minimum_product_amount: { type: 'string', optional: true },
        maximum_product_amount: { type: 'string', optional: true },
        description: { type: 'string', optional: true }
      });

      const response = await retryOperation(() => api.post('coupons', couponData));
      
      // Инвалидация кэша
      await cacheData('coupons_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании купона:', error);
      throw error;
    }
  };

  /**
   * Обновляет существующий купон
   * @param id ID купона
   * @param couponData Данные для обновления
   * @returns Обновленный купон
   */
  const updateCoupon = async (id: number, couponData: any) => {
    try {
      validateInput({ id, ...couponData }, {
        id: { type: 'number', required: true },
        code: { type: 'string', optional: true },
        discount_type: { 
          type: 'string', 
          enum: ['percent', 'fixed_cart', 'fixed_product'], 
          optional: true 
        },
        amount: { type: 'string', optional: true },
        individual_use: { type: 'boolean', optional: true },
        exclude_sale_items: { type: 'boolean', optional: true },
        minimum_amount: { type: 'string', optional: true },
        maximum_amount: { type: 'string', optional: true },
        email_restrictions: { type: 'array', optional: true },
        usage_limit: { type: 'number', optional: true },
        usage_limit_per_user: { type: 'number', optional: true },
        limit_usage_to_x_items: { type: 'number', optional: true },
        usage_count: { type: 'number', optional: true },
        date_expires: { type: 'string', optional: true },
        free_shipping: { type: 'boolean', optional: true },
        product_ids: { type: 'array', optional: true },
        excluded_product_ids: { type: 'array', optional: true },
        product_categories: { type: 'array', optional: true },
        excluded_product_categories: { type: 'array', optional: true },
        exclude_backorder_products: { type: 'boolean', optional: true },
        exclude_products_on_sale: { type: 'boolean', optional: true },
        minimum_product_amount: { type: 'string', optional: true },
        maximum_product_amount: { type: 'string', optional: true },
        description: { type: 'string', optional: true }
      });

      const response = await retryOperation(() => api.put(`coupons/${id}`, couponData));
      
      // Инвалидация кэша
      await cacheData(`coupon_${id}`, null, 0);
      await cacheData('coupons_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении купона с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет купон
   * @param id ID купона
   * @param force Принудительное удаление
   * @returns Результат операции
   */
  const deleteCoupon = async (id: number, force: boolean = false) => {
    try {
      validateInput({ id, force }, {
        id: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const response = await retryOperation(() => api.delete(`coupons/${id}`, { force }));
      
      // Инвалидация кэша
      await cacheData(`coupon_${id}`, null, 0);
      await cacheData('coupons_*', null, 0, true);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при удалении купона с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Получает количество использований купона
   * @param couponId ID купона
   * @returns Количество использований
   */
  const getCouponUsage = async (couponId: number) => {
    try {
      validateInput({ couponId }, {
        couponId: { type: 'number', required: true }
      });

      // Получаем данные купона
      const coupon = await getCoupon(couponId);
      
      return {
        usage_count: coupon.usage_count || 0,
        usage_limit: coupon.usage_limit || null,
        usage_limit_per_user: coupon.usage_limit_per_user || null,
        date_expires: coupon.date_expires || null
      };
    } catch (error) {
      console.error(`Ошибка при получении использования купона с ID ${couponId}:`, error);
      throw error;
    }
  };

  /**
   * Проверяет действительность купона
   * @param code Код купона
   * @returns Информация о действительности купона
   */
  const validateCoupon = async (code: string) => {
    try {
      validateInput({ code }, {
        code: { type: 'string', required: true }
      });

      // Получаем купоны с этим кодом
      const coupons = await listCoupons({ code });
      
      if (!coupons || coupons.length === 0) {
        return {
          valid: false,
          reason: 'Купон не найден'
        };
      }

      const coupon = coupons[0];
      const now = new Date();
      let valid = true;
      let reason = '';

      // Проверка даты истечения
      if (coupon.date_expires && new Date(coupon.date_expires) < now) {
        valid = false;
        reason = 'Купон истек';
      }

      // Проверка лимита использования
      if (valid && coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        valid = false;
        reason = 'Купон достиг максимального количества использований';
      }

      return {
        valid,
        reason,
        coupon: valid ? coupon : null
      };
    } catch (error) {
      console.error(`Ошибка при валидации купона с кодом ${code}:`, error);
      throw error;
    }
  };

  /**
   * Создает массовые купоны
   * @param baseCode Базовый код для генерации уникальных кодов
   * @param count Количество купонов для создания
   * @param couponTemplate Шаблон купона с общими настройками
   * @returns Массив созданных купонов
   */
  const createBulkCoupons = async (baseCode: string, count: number, couponTemplate: any) => {
    try {
      validateInput({ baseCode, count, couponTemplate }, {
        baseCode: { type: 'string', required: true },
        count: { type: 'number', required: true, min: 1, max: 100 },
        couponTemplate: { type: 'object', required: true }
      });

      const createdCoupons = [];
      
      for (let i = 1; i <= count; i++) {
        const code = `${baseCode}-${i.toString().padStart(3, '0')}`;
        const couponData = {
          ...couponTemplate,
          code
        };
        
        const coupon = await createCoupon(couponData);
        createdCoupons.push(coupon);
      }
      
      return createdCoupons;
    } catch (error) {
      console.error('Ошибка при массовом создании купонов:', error);
      throw error;
    }
  };

  return {
    listCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponUsage,
    validateCoupon,
    createBulkCoupons
  };
};

export default createCouponTools;
