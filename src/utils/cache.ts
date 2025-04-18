import Redis from 'ioredis';

// Проверка наличия Redis из переменных окружения
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisEnabled = process.env.USE_REDIS === 'true';

// Создание Redis-клиента, если Redis включен
const redisClient = redisEnabled 
  ? new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    })
  : null;

// Простой локальный кэш для использования, если Redis недоступен
const localCache = new Map<string, { data: any; expiry: number }>();

/**
 * Получить данные из кэша
 * @param key Ключ кэша
 * @returns Кэшированные данные или null, если данных нет
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    // Если Redis включен, используем его
    if (redisClient) {
      const data = await redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    }
    
    // Иначе используем локальный кэш
    const cachedItem = localCache.get(key);
    if (!cachedItem) return null;
    
    // Проверка срока действия кэша
    if (cachedItem.expiry < Date.now()) {
      localCache.delete(key);
      return null;
    }
    
    return cachedItem.data as T;
  } catch (error) {
    console.error(`Ошибка при получении кэша для ключа "${key}":`, error);
    return null;
  }
}

/**
 * Сохранить данные в кэш
 * @param key Ключ кэша
 * @param data Данные для кэширования
 * @param ttlSeconds Время жизни кэша в секундах
 */
export async function setCache<T>(key: string, data: T, ttlSeconds = 300): Promise<void> {
  try {
    // Если Redis включен, используем его
    if (redisClient) {
      await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
      return;
    }
    
    // Иначе используем локальный кэш
    localCache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000
    });
  } catch (error) {
    console.error(`Ошибка при сохранении кэша для ключа "${key}":`, error);
  }
}

/**
 * Удалить данные из кэша
 * @param key Ключ кэша или шаблон ключа с "*"
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    // Если Redis включен, используем его
    if (redisClient) {
      if (key.includes('*')) {
        // Для шаблонов ключей используем SCAN и удаляем все совпадающие ключи
        let cursor = '0';
        do {
          const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', key);
          cursor = nextCursor;
          
          if (keys.length > 0) {
            await redisClient.del(...keys);
          }
        } while (cursor !== '0');
      } else {
        // Удаление конкретного ключа
        await redisClient.del(key);
      }
      return;
    }
    
    // Иначе используем локальный кэш
    if (key.includes('*')) {
      const regex = new RegExp(key.replace('*', '.*'));
      for (const cacheKey of localCache.keys()) {
        if (regex.test(cacheKey)) {
          localCache.delete(cacheKey);
        }
      }
    } else {
      localCache.delete(key);
    }
  } catch (error) {
    console.error(`Ошибка при инвалидации кэша для ключа "${key}":`, error);
  }
}

/**
 * Функция-обертка для кэширования результатов функции
 * @param fn Функция, результаты которой нужно кэшировать
 * @param keyPrefix Префикс для ключа кэша
 * @param ttlSeconds Время жизни кэша в секундах
 * @returns Результат функции из кэша или вычисленный функцией
 */
export function withCache<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  keyPrefix: string,
  ttlSeconds = 300
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    // Формируем ключ кэша на основе префикса и аргументов
    const key = `${keyPrefix}:${JSON.stringify(args)}`;
    
    // Пробуем получить данные из кэша
    const cachedData = await getCache<T>(key);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // Вычисляем результат функции
    const result = await fn(...args);
    
    // Сохраняем результат в кэш
    await setCache(key, result, ttlSeconds);
    
    return result;
  };
}

/**
 * Закрыть соединение с Redis при завершении работы приложения
 */
export function closeCacheConnection(): void {
  if (redisClient) {
    redisClient.disconnect();
  }
}

// Обработка сигналов завершения для корректного закрытия соединения с Redis
process.on('SIGTERM', closeCacheConnection);
process.on('SIGINT', closeCacheConnection);
