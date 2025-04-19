import { retryOperation } from '../utils/retry';
import { validateInput } from '../utils/validation';
import { cacheData, getCachedData } from '../utils/cache';
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * Создает инструменты для работы с медиа-файлами WordPress и WooCommerce
 * @param config Конфигурация WordPress API (с учетными данными)
 * @returns Объект с функциями для работы с медиа-файлами
 */
export const createMediaTools = (config: any) => {
  // Базовые настройки для авторизации в WordPress REST API
  const wpBaseUrl = `${config.url}/wp-json/wp/v2`;
  const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  const headers = {
    'Authorization': `Basic ${credentials}`,
    'Accept': 'application/json'
  };

  /**
   * Получает список медиа-файлов
   * @param params Параметры запроса
   * @returns Список медиа-файлов
   */
  const listMedia = async (params: any = {}) => {
    try {
      validateInput(params, {
        page: { type: 'number', min: 1, optional: true },
        per_page: { type: 'number', min: 1, max: 100, optional: true },
        search: { type: 'string', optional: true },
        after: { type: 'string', optional: true },
        author: { type: 'number', optional: true },
        media_type: { type: 'string', optional: true },
        mime_type: { type: 'string', optional: true }
      });

      // Формирование URL с параметрами
      let url = `${wpBaseUrl}/media`;
      if (Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        for (const key in params) {
          queryParams.append(key, params[key].toString());
        }
        url += `?${queryParams.toString()}`;
      }

      const cacheKey = `media_list_${JSON.stringify(params)}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => 
        fetch(url, { headers })
      );

      if (!response.ok) {
        throw new Error(`Error fetching media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      await cacheData(cacheKey, data, 60); // Кэш на 60 секунд
      
      return data;
    } catch (error) {
      console.error('Ошибка при получении списка медиа-файлов:', error);
      throw error;
    }
  };

  /**
   * Получает информацию о конкретном медиа-файле
   * @param id ID медиа-файла
   * @returns Данные медиа-файла
   */
  const getMedia = async (id: number) => {
    try {
      validateInput({ id }, {
        id: { type: 'number', required: true }
      });

      const cacheKey = `media_${id}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) return cachedData;

      const response = await retryOperation(() => 
        fetch(`${wpBaseUrl}/media/${id}`, { headers })
      );

      if (!response.ok) {
        throw new Error(`Error fetching media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      await cacheData(cacheKey, data, 60);
      
      return data;
    } catch (error) {
      console.error(`Ошибка при получении медиа-файла с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Загружает медиа-файл в библиотеку WordPress
   * @param file Buffer или путь к файлу
   * @param filename Имя файла
   * @param mimeType MIME-тип файла
   * @param title Заголовок медиа-файла (опционально)
   * @param caption Подпись медиа-файла (опционально)
   * @param altText Альтернативный текст (опционально)
   * @param description Описание медиа-файла (опционально)
   * @returns Загруженный медиа-файл
   */
  const uploadMedia = async (
    file: Buffer | string,
    filename: string,
    mimeType: string,
    title?: string,
    caption?: string,
    altText?: string,
    description?: string
  ) => {
    try {
      validateInput(
        { filename, mimeType },
        {
          filename: { type: 'string', required: true },
          mimeType: { type: 'string', required: true }
        }
      );

      const formData = new FormData();
      
      // Добавление медиа-файла
      if (Buffer.isBuffer(file)) {
        formData.append('file', file, { filename, contentType: mimeType });
      } else {
        formData.append('file', file);
      }
      
      // Добавление метаданных
      if (title) formData.append('title', title);
      if (caption) formData.append('caption', caption);
      if (altText) formData.append('alt_text', altText);
      if (description) formData.append('description', description);

      const uploadHeaders = {
        ...headers,
        ...formData.getHeaders()
      };

      const response = await retryOperation(() => 
        fetch(`${wpBaseUrl}/media`, {
          method: 'POST',
          headers: uploadHeaders,
          body: formData
        })
      );

      if (!response.ok) {
        throw new Error(`Error uploading media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Инвалидация кэша списка медиа
      await cacheData('media_list_*', null, 0, true);
      
      return data;
    } catch (error) {
      console.error('Ошибка при загрузке медиа-файла:', error);
      throw error;
    }
  };

  /**
   * Загружает медиа-файл из base64-строки
   * @param base64Data Base64-строка с данными файла
   * @param filename Имя файла
   * @param mimeType MIME-тип файла
   * @param title Заголовок медиа-файла (опционально)
   * @param caption Подпись медиа-файла (опционально)
   * @param altText Альтернативный текст (опционально)
   * @param description Описание медиа-файла (опционально)
   * @returns Загруженный медиа-файл
   */
  const uploadMediaFromBase64 = async (
    base64Data: string,
    filename: string,
    mimeType: string,
    title?: string,
    caption?: string,
    altText?: string,
    description?: string
  ) => {
    try {
      // Проверяем и очищаем base64-строку от префикса (data:image/jpeg;base64,)
      let cleanBase64 = base64Data;
      if (base64Data.includes(';base64,')) {
        cleanBase64 = base64Data.split(';base64,')[1];
      }

      // Преобразуем base64 в Buffer
      const fileBuffer = Buffer.from(cleanBase64, 'base64');

      // Используем основную функцию загрузки
      return await uploadMedia(
        fileBuffer,
        filename,
        mimeType,
        title,
        caption,
        altText,
        description
      );
    } catch (error) {
      console.error('Ошибка при загрузке медиа-файла из base64:', error);
      throw error;
    }
  };

  /**
   * Обновляет метаданные медиа-файла
   * @param id ID медиа-файла
   * @param mediaData Данные для обновления
   * @returns Обновленный медиа-файл
   */
  const updateMedia = async (id: number, mediaData: any) => {
    try {
      validateInput({ id, ...mediaData }, {
        id: { type: 'number', required: true },
        title: { type: 'string', optional: true },
        caption: { type: 'string', optional: true },
        alt_text: { type: 'string', optional: true },
        description: { type: 'string', optional: true }
      });

      const response = await retryOperation(() => 
        fetch(`${wpBaseUrl}/media/${id}`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mediaData)
        })
      );

      if (!response.ok) {
        throw new Error(`Error updating media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Инвалидация кэша
      await cacheData(`media_${id}`, null, 0);
      await cacheData('media_list_*', null, 0, true);
      
      return data;
    } catch (error) {
      console.error(`Ошибка при обновлении медиа-файла с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Удаляет медиа-файл
   * @param id ID медиа-файла
   * @param force Принудительное удаление (пропуск корзины)
   * @returns Результат операции
   */
  const deleteMedia = async (id: number, force: boolean = false) => {
    try {
      validateInput({ id, force }, {
        id: { type: 'number', required: true },
        force: { type: 'boolean', optional: true }
      });

      const url = `${wpBaseUrl}/media/${id}?force=${force ? 'true' : 'false'}`;

      const response = await retryOperation(() => 
        fetch(url, {
          method: 'DELETE',
          headers
        })
      );

      if (!response.ok) {
        throw new Error(`Error deleting media: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Инвалидация кэша
      await cacheData(`media_${id}`, null, 0);
      await cacheData('media_list_*', null, 0, true);
      
      return data;
    } catch (error) {
      console.error(`Ошибка при удалении медиа-файла с ID ${id}:`, error);
      throw error;
    }
  };

  /**
   * Назначает медиа-файл как изображение товара
   * @param productId ID товара
   * @param mediaId ID медиа-файла
   * @param isFeature Установить как основное изображение
   * @returns Обновленный товар
   */
  const assignMediaToProduct = async (productId: number, mediaId: number, isFeature: boolean = true) => {
    try {
      validateInput({ productId, mediaId, isFeature }, {
        productId: { type: 'number', required: true },
        mediaId: { type: 'number', required: true },
        isFeature: { type: 'boolean', optional: true }
      });

      // Формируем данные для обновления товара
      const productData: any = {};
      
      if (isFeature) {
        // Установка основного изображения товара
        productData.images = [{ id: mediaId }];
      } else {
        // Добавление изображения в галерею товара
        // Сначала получаем текущие данные товара
        const wooBaseUrl = `${config.url}/wp-json/wc/v3`;
        const wooCredentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
        const wooHeaders = {
          'Authorization': `Basic ${wooCredentials}`,
          'Accept': 'application/json'
        };
        
        const productResponse = await retryOperation(() => 
          fetch(`${wooBaseUrl}/products/${productId}`, {
            headers: wooHeaders
          })
        );

        if (!productResponse.ok) {
          throw new Error(`Error fetching product: ${productResponse.status} ${productResponse.statusText}`);
        }

        const product = await productResponse.json();
        
        // Добавляем новое изображение к существующим
        const currentImages = product.images || [];
        productData.images = [...currentImages, { id: mediaId }];
      }

      // Обновляем товар
      const wooBaseUrl = `${config.url}/wp-json/wc/v3`;
      const wooCredentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
      const wooHeaders = {
        'Authorization': `Basic ${wooCredentials}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const updateResponse = await retryOperation(() => 
        fetch(`${wooBaseUrl}/products/${productId}`, {
          method: 'PUT',
          headers: wooHeaders,
          body: JSON.stringify(productData)
        })
      );

      if (!updateResponse.ok) {
        throw new Error(`Error updating product: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      return await updateResponse.json();
    } catch (error) {
      console.error(`Ошибка при назначении медиа-файла ${mediaId} товару ${productId}:`, error);
      throw error;
    }
  };

  /**
   * Загружает изображение и назначает его товару за одну операцию
   * @param productId ID товара
   * @param imageData Данные изображения (Buffer или base64)
   * @param filename Имя файла
   * @param isBase64 Флаг, указывающий, что imageData в формате base64
   * @param isFeature Установить как основное изображение
   * @returns Обновленный товар
   */
  const uploadProductImage = async (
    productId: number,
    imageData: Buffer | string,
    filename: string,
    isBase64: boolean = false,
    isFeature: boolean = true
  ) => {
    try {
      // Определяем MIME-тип на основе расширения файла
      const ext = filename.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg'; // По умолчанию
      
      if (ext === 'png') mimeType = 'image/png';
      else if (ext === 'gif') mimeType = 'image/gif';
      else if (ext === 'webp') mimeType = 'image/webp';
      else if (ext === 'svg') mimeType = 'image/svg+xml';
      
      // Загружаем изображение
      let uploadedMedia;
      if (isBase64 && typeof imageData === 'string') {
        uploadedMedia = await uploadMediaFromBase64(
          imageData,
          filename,
          mimeType,
          `Изображение товара ${productId}`
        );
      } else if (Buffer.isBuffer(imageData)) {
        uploadedMedia = await uploadMedia(
          imageData,
          filename,
          mimeType,
          `Изображение товара ${productId}`
        );
      } else {
        throw new Error('Невалидные данные изображения');
      }
      
      // Назначаем изображение товару
      return await assignMediaToProduct(productId, uploadedMedia.id, isFeature);
    } catch (error) {
      console.error(`Ошибка при загрузке изображения для товара ${productId}:`, error);
      throw error;
    }
  };

  return {
    listMedia,
    getMedia,
    uploadMedia,
    uploadMediaFromBase64,
    updateMedia,
    deleteMedia,
    assignMediaToProduct,
    uploadProductImage
  };
};

export default createMediaTools;
