import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';

/**
 * Создает инструменты для работы с настройками WooCommerce
 * @param config Конфигурация WooCommerce API
 * @returns Объект с функциями для работы с настройками
 */
export const createSettingsTools = (config: any) => {
  const api = new WooCommerceRestApi({
    url: config.url,
    consumerKey: config.consumerKey,
    consumerSecret: config.consumerSecret,
    version: 'wc/v3'
  });

  /**
   * Получает список всех групп настроек
   * @returns Список групп настроек
   */
  const listSettingsGroups = async () => {
    try {
      const cacheKey = 'settings_groups';
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get('settings'));
      await cacheData(cacheKey, response.data, 3600); // Кэш на 1 час
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении групп настроек:', error);
      throw error;
    }
  };

  /**
   * Получает настройки для конкретной группы
   * @param group ID группы настроек
   * @returns Настройки группы
   */
  const getSettingsGroup = async (group: string) => {
    try {
      validateInput({ group }, {
        group: { type: 'string', required: true }
      });

      const cacheKey = `settings_group_${group}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`settings/${group}`));
      await cacheData(cacheKey, response.data, 3600); // Кэш на 1 час
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении настроек группы ${group}:`, error);
      throw error;
    }
  };

  /**
   * Получает значение конкретной настройки
   * @param group ID группы настроек
   * @param id ID настройки
   * @returns Значение настройки
   */
  const getSetting = async (group: string, id: string) => {
    try {
      validateInput({ group, id }, {
        group: { type: 'string', required: true },
        id: { type: 'string', required: true }
      });

      const cacheKey = `setting_${group}_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => api.get(`settings/${group}/${id}`));
      await cacheData(cacheKey, response.data, 3600); // Кэш на 1 час
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении настройки ${id} из группы ${group}:`, error);
      throw error;
    }
  };

  /**
   * Обновляет значение настройки
   * @param group ID группы настроек
   * @param id ID настройки
   * @param value Новое значение
   * @returns Обновленное значение настройки
   */
  const updateSetting = async (group: string, id: string, value: any) => {
    try {
      validateInput({ group, id }, {
        group: { type: 'string', required: true },
        id: { type: 'string', required: true }
      });

      const response = await retryOperation(() => api.put(`settings/${group}/${id}`, { value }));
      
      // Инвалидация кэша
      await cacheData(`setting_${group}_${id}`, null, 0);
      await cacheData(`settings_group_${group}`, null, 0);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении настройки ${id} в группе ${group}:`, error);
      throw error;
    }
  };

  /**
   * Обновляет несколько настроек в группе за один запрос
   * @param group ID группы настроек
   * @param settings Объект с настройками для обновления
   * @returns Обновленные настройки
   */
  const batchUpdateSettings = async (group: string, settings: Record<string, any>) => {
    try {
      validateInput({ group }, {
        group: { type: 'string', required: true }
      });

      // Преобразуем объект настроек в формат, который ожидает WooCommerce API
      const update = Object.entries(settings).map(([id, value]) => ({
        id,
        value
      }));

      const response = await retryOperation(() => api.post(`settings/${group}/batch`, { update }));
      
      // Инвалидация кэша
      await cacheData(`settings_group_${group}`, null, 0);
      for (const id of Object.keys(settings)) {
        await cacheData(`setting_${group}_${id}`, null, 0);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении настроек в группе ${group}:`, error);
      throw error;
    }
  };

  /**
   * Получает настройки валюты
   * @returns Настройки валюты
   */
  const getCurrencySettings = async () => {
    try {
      return await getSettingsGroup('general');
    } catch (error) {
      console.error('Ошибка при получении настроек валюты:', error);
      throw error;
    }
  };

  /**
   * Обновляет настройки валюты
   * @param currencyCode Код валюты (например, USD, EUR)
   * @param currencyPosition Позиция символа валюты
   * @param thousandSeparator Разделитель тысяч
   * @param decimalSeparator Десятичный разделитель
   * @param numDecimals Количество десятичных знаков
   * @returns Обновленные настройки валюты
   */
  const updateCurrencySettings = async (
    currencyCode?: string,
    currencyPosition?: string,
    thousandSeparator?: string,
    decimalSeparator?: string,
    numDecimals?: number
  ) => {
    try {
      const settings: Record<string, any> = {};
      
      if (currencyCode) settings['woocommerce_currency'] = currencyCode;
      if (currencyPosition) settings['woocommerce_currency_pos'] = currencyPosition;
      if (thousandSeparator) settings['woocommerce_price_thousand_sep'] = thousandSeparator;
      if (decimalSeparator) settings['woocommerce_price_decimal_sep'] = decimalSeparator;
      if (numDecimals !== undefined) settings['woocommerce_price_num_decimals'] = numDecimals;
      
      return await batchUpdateSettings('general', settings);
    } catch (error) {
      console.error('Ошибка при обновлении настроек валюты:', error);
      throw error;
    }
  };

  /**
   * Получает настройки магазина (адрес, название и т.д.)
   * @returns Настройки магазина
   */
  const getStoreSettings = async () => {
    try {
      const generalSettings = await getSettingsGroup('general');
      
      // Фильтруем только настройки магазина
      const storeSettings = generalSettings.filter((setting: any) => 
        setting.id.startsWith('woocommerce_store_') || 
        setting.id === 'blogname' || 
        setting.id === 'blogdescription'
      );
      
      return storeSettings;
    } catch (error) {
      console.error('Ошибка при получении настроек магазина:', error);
      throw error;
    }
  };

  /**
   * Обновляет настройки магазина
   * @param storeName Название магазина
   * @param storeDescription Описание магазина
   * @param storeAddress Адрес магазина
   * @param storeCity Город
   * @param storePostcode Почтовый индекс
   * @param storeCountry Страна (код)
   * @returns Обновленные настройки
   */
  const updateStoreSettings = async (
    storeName?: string,
    storeDescription?: string,
    storeAddress?: string,
    storeCity?: string,
    storePostcode?: string,
    storeCountry?: string
  ) => {
    try {
      const settings: Record<string, any> = {};
      
      if (storeName) settings['blogname'] = storeName;
      if (storeDescription) settings['blogdescription'] = storeDescription;
      if (storeAddress) settings['woocommerce_store_address'] = storeAddress;
      if (storeCity) settings['woocommerce_store_city'] = storeCity;
      if (storePostcode) settings['woocommerce_store_postcode'] = storePostcode;
      if (storeCountry) settings['woocommerce_default_country'] = storeCountry;
      
      return await batchUpdateSettings('general', settings);
    } catch (error) {
      console.error('Ошибка при обновлении настроек магазина:', error);
      throw error;
    }
  };

  /**
   * Получает настройки доставки
   * @returns Настройки доставки
   */
  const getShippingSettings = async () => {
    try {
      return await getSettingsGroup('shipping');
    } catch (error) {
      console.error('Ошибка при получении настроек доставки:', error);
      throw error;
    }
  };

  /**
   * Получает настройки налогов
   * @returns Настройки налогов
   */
  const getTaxSettings = async () => {
    try {
      return await getSettingsGroup('tax');
    } catch (error) {
      console.error('Ошибка при получении настроек налогов:', error);
      throw error;
    }
  };

  /**
   * Включает или отключает налоги
   * @param enableTaxes Включить налоги
   * @returns Обновленные настройки
   */
  const updateTaxSettings = async (enableTaxes: boolean) => {
    try {
      return await updateSetting('tax', 'woocommerce_calc_taxes', enableTaxes);
    } catch (error) {
      console.error('Ошибка при обновлении настроек налогов:', error);
      throw error;
    }
  };

  /**
   * Получает настройки оформления заказа
   * @returns Настройки оформления заказа
   */
  const getCheckoutSettings = async () => {
    try {
      return await getSettingsGroup('checkout');
    } catch (error) {
      console.error('Ошибка при получении настроек оформления заказа:', error);
      throw error;
    }
  };

  /**
   * Получает настройки учетных записей
   * @returns Настройки учетных записей
   */
  const getAccountSettings = async () => {
    try {
      return await getSettingsGroup('account');
    } catch (error) {
      console.error('Ошибка при получении настроек учетных записей:', error);
      throw error;
    }
  };

  /**
   * Обновляет настройки учетных записей
   * @param enableRegistration Разрешить регистрацию
   * @param generateUsername Генерировать имя пользователя
   * @param generatePassword Генерировать пароль
   * @returns Обновленные настройки
   */
  const updateAccountSettings = async (
    enableRegistration?: boolean,
    generateUsername?: boolean,
    generatePassword?: boolean
  ) => {
    try {
      const settings: Record<string, any> = {};
      
      if (enableRegistration !== undefined) {
        settings['woocommerce_enable_signup_and_login_from_checkout'] = enableRegistration;
        settings['woocommerce_enable_myaccount_registration'] = enableRegistration;
      }
      
      if (generateUsername !== undefined) {
        settings['woocommerce_registration_generate_username'] = generateUsername;
      }
      
      if (generatePassword !== undefined) {
        settings['woocommerce_registration_generate_password'] = generatePassword;
      }
      
      return await batchUpdateSettings('account', settings);
    } catch (error) {
      console.error('Ошибка при обновлении настроек учетных записей:', error);
      throw error;
    }
  };

  /**
   * Получает все настройки магазина
   * @returns Объект со всеми настройками
   */
  const getAllSettings = async () => {
    try {
      const groups = await listSettingsGroups();
      const settings: Record<string, any> = {};
      
      for (const group of groups) {
        settings[group.id] = await getSettingsGroup(group.id);
      }
      
      return settings;
    } catch (error) {
      console.error('Ошибка при получении всех настроек:', error);
      throw error;
    }
  };

  return {
    listSettingsGroups,
    getSettingsGroup,
    getSetting,
    updateSetting,
    batchUpdateSettings,
    getCurrencySettings,
    updateCurrencySettings,
    getStoreSettings,
    updateStoreSettings,
    getShippingSettings,
    getTaxSettings,
    updateTaxSettings,
    getCheckoutSettings,
    getAccountSettings,
    updateAccountSettings,
    getAllSettings
  };
};

export default createSettingsTools;
