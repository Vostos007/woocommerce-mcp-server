/**
 * Опции для функции повторных попыток
 */
export interface RetryOptions {
  /** Максимальное количество попыток (включая первую) */
  maxRetries: number;
  
  /** Начальная задержка перед повторной попыткой (мс) */
  initialDelay: number;
  
  /** Множитель для экспоненциального увеличения задержки */
  backoffFactor: number;
  
  /** Максимальная задержка между попытками (мс) */
  maxDelay: number;
  
  /** Функция для проверки, нужно ли повторять попытку для данной ошибки */
  shouldRetry?: (error: any, attempt: number) => boolean;
  
  /** Функция, вызываемая перед каждой повторной попыткой */
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

/**
 * Значения по умолчанию для опций повторных попыток
 */
const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  initialDelay: 300,
  backoffFactor: 2,
  maxDelay: 10000,
  shouldRetry: () => true,
  onRetry: (error, attempt, delay) => {
    console.warn(`Повторная попытка #${attempt} через ${delay}мс из-за ошибки:`, error.message);
  }
};

/**
 * Функция для выполнения кода с автоматическими повторными попытками при сбоях
 * @param fn Асинхронная функция, которую нужно выполнить
 * @param options Опции для повторных попыток
 * @returns Результат выполнения функции
 * @throws Последняя возникшая ошибка, если все попытки не удались
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // Объединяем значения по умолчанию с переданными опциями
  const opts: RetryOptions = { ...defaultRetryOptions, ...options };
  
  let lastError: any;
  
  // Выполняем функцию с повторными попытками
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      // Пытаемся выполнить функцию
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Последняя попытка - больше не повторяем
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Проверяем, нужно ли повторять попытку для данной ошибки
      if (opts.shouldRetry && !opts.shouldRetry(error, attempt)) {
        break;
      }
      
      // Вычисляем задержку перед следующей попыткой (экспоненциальная задержка)
      const delay = Math.min(
        opts.initialDelay * Math.pow(opts.backoffFactor, attempt - 1),
        opts.maxDelay
      );
      
      // Добавляем случайный джиттер (±20%) для предотвращения эффекта "стампеда"
      const jitter = 0.8 + Math.random() * 0.4;
      const actualDelay = Math.floor(delay * jitter);
      
      // Вызываем колбэк перед повторной попыткой
      if (opts.onRetry) {
        opts.onRetry(error, attempt, actualDelay);
      }
      
      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  // Если все попытки не удались, выбрасываем последнюю ошибку
  throw lastError;
}

/**
 * Функция для создания версии функции с автоматическими повторными попытками
 * @param fn Функция, которую нужно обернуть
 * @param options Опции для повторных попыток
 * @returns Функция с повторными попытками
 */
export function createRetryableFunction<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  options: Partial<RetryOptions> = {}
): (...args: Args) => Promise<T> {
  return (...args: Args): Promise<T> => {
    return withRetry(() => fn(...args), options);
  };
}

/**
 * Проверки ошибок для определения, нужно ли повторять попытку
 */
export const retryChecks = {
  /**
   * Повторять попытку для сетевых ошибок
   */
  isNetworkError: (error: any): boolean => {
    return (
      error.code === 'ECONNRESET' ||
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ESOCKETTIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN' ||
      error.message?.includes('network') ||
      error.message?.includes('timeout')
    );
  },
  
  /**
   * Повторять попытку для ошибок сервера (5xx)
   */
  isServerError: (error: any): boolean => {
    return error.status >= 500 || error.statusCode >= 500;
  },
  
  /**
   * Повторять попытку для превышения лимита запросов (429)
   */
  isRateLimitError: (error: any): boolean => {
    return error.status === 429 || error.statusCode === 429;
  },
  
  /**
   * Повторять попытку для временных ошибок
   */
  isTransientError: (error: any): boolean => {
    return (
      retryChecks.isNetworkError(error) ||
      retryChecks.isServerError(error) ||
      retryChecks.isRateLimitError(error)
    );
  }
};
