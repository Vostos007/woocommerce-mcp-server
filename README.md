# WooCommerce MCP Server

[![CI/CD Pipeline](https://github.com/Vostos007/woocommerce-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/Vostos007/woocommerce-mcp-server/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

MCP (Model Context Protocol) сервер для интеграции магазина WooCommerce с AI-ассистентами и системами управления задачами, такими как Task Master.

## Возможности

- 🚀 Полная интеграция с WooCommerce REST API v3
- 🔄 Двусторонняя синхронизация данных между WooCommerce и Task Master
- 🧠 Совместимость с MCP 1.0 для AI-ассистентов
- 📊 Управление товарами, заказами, клиентами и аналитикой
- 📝 Поддержка WordPress-контента (статьи, SEO)
- 🔔 Обработка вебхуков для реактивной синхронизации
- 🛠️ Расширенные утилиты для кэширования, повторных попыток и валидации

## Содержание

- [Требования](#требования)
- [Установка](#установка)
- [Быстрый старт](#быстрый-старт)
- [Настройка](#настройка)
- [Интеграция с Task Master](#интеграция-с-task-master)
- [Использование вебхуков](#использование-вебхуков)
- [Docker](#docker)
- [Разработка](#разработка)
- [Документация](#документация)
- [Тестирование](#тестирование)
- [Решение проблем](#решение-проблем)
- [Лицензия](#лицензия)

## Требования

- Node.js 16.x или выше
- WooCommerce 3.5+ с REST API v3
- Опционально: Redis для кэширования и очередей задач

## Установка

### С использованием npm

```bash
# Клонирование репозитория
git clone https://github.com/Vostos007/woocommerce-mcp-server.git

# Установка зависимостей
cd woocommerce-mcp-server
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте файл .env вашими данными

# Сборка проекта
npm run build

# Запуск сервера
npm start
```

### С использованием Docker

```bash
# Клонирование репозитория
git clone https://github.com/Vostos007/woocommerce-mcp-server.git
cd woocommerce-mcp-server

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте файл .env вашими данными

# Запуск с помощью Docker Compose
docker-compose up -d
```

## Быстрый старт

1. **Получение ключей WooCommerce API**:
   - Перейдите в админ-панель WooCommerce → Настройки → Дополнительно → REST API
   - Добавьте новый ключ с правами чтения/записи
   - Скопируйте Consumer Key и Consumer Secret

2. **Настройка переменных окружения**:
   - Отредактируйте файл `.env` и добавьте ключи API

3. **Запуск сервера**:
   ```bash
   npm start
   ```

4. **Проверка работоспособности**:
   ```bash
   # Тестирование соединения с WooCommerce
   node scripts/test-connection.js
   
   # Тестирование API товаров
   node scripts/test-products.js
   
   # Тестирование API заказов
   node scripts/test-orders.js
   ```

## Настройка

### Конфигурация WooCommerce

Для корректной работы с API WooCommerce, убедитесь, что:

1. У вас установлена версия WooCommerce 3.5 или выше
2. REST API включен в настройках WooCommerce
3. Созданы ключи API с достаточными правами

### Настройка Redis (опционально)

Для улучшения производительности и надежности, вы можете включить интеграцию с Redis:

1. Установите Redis на ваш сервер или используйте облачный сервис
2. Настройте параметры подключения в файле `.env`:
   ```
   USE_REDIS=true
   REDIS_URL=redis://localhost:6379
   ```

### Настройка уровня логирования

Вы можете настроить уровень логирования в файле `.env`:

```
# Доступные уровни: debug, info, warn, error
LOG_LEVEL=info
```

## Интеграция с Task Master

Для подключения к системе управления задачами Task Master:

1. **Настройка параметров Task Master в `.env`**:
   ```
   TASK_MASTER_URL=http://your-task-master-url.com
   TASK_MASTER_API_KEY=your-api-key
   ```

2. **Настройка автоматической синхронизации**:
   - Создайте проект в Task Master для WooCommerce
   - Скопируйте ID проекта и добавьте в настройки вебхуков
   - Настройте вебхуки для отслеживания изменений

Подробная инструкция по интеграции с Task Master находится в [документации по интеграции](docs/mcp-integration.md).

## Использование вебхуков

WooCommerce MCP Server поддерживает вебхуки для реактивного обновления данных.

### Настройка вебхуков WooCommerce

1. Добавьте настройки вебхуков в файл `.env`:
   ```
   WEBHOOK_SECRET=your-webhook-secret
   ```

2. Создайте вебхуки с помощью скрипта:
   ```bash
   node scripts/setup-webhooks.js
   ```

3. Или используйте утилиту для управления вебхуками:
   ```javascript
   import { WebhookManager } from './src/utils/webhooks';
   
   const webhookManager = new WebhookManager(wooConfig, 'your-secret');
   await webhookManager.setupTaskMasterWebhooks('https://your-server.com/webhooks');
   ```

## Docker

### Локальная разработка с Docker

```bash
# Запуск в режиме разработки
docker-compose up
```

### Производственное развертывание

```bash
# Сборка производственного образа
docker build -t woocommerce-mcp-server:latest .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env woocommerce-mcp-server:latest
```

### Переменные окружения в Docker

Вы можете передать переменные окружения непосредственно в `docker run`:

```bash
docker run -p 3000:3000 \
  -e WOOCOMMERCE_URL=https://your-store.com \
  -e WOOCOMMERCE_KEY=your-key \
  -e WOOCOMMERCE_SECRET=your-secret \
  woocommerce-mcp-server:latest
```

## Разработка

### Структура проекта

```
/woocommerce-mcp-server
  /docs                      # Документация
  /scripts                   # Вспомогательные скрипты
  /src
    /tools                   # Инструменты для работы с API
      products.ts            # Функции для работы с товарами
      orders.ts              # Функции для работы с заказами
      customers.ts           # Функции для работы с клиентами
      analytics.ts           # Функции для аналитики
      posts.ts               # Функции для работы со статьями
      seo.ts                 # Функции для работы с SEO
    /utils                   # Утилиты
      woocommerce.ts         # Клиент для WooCommerce API
      wordpress.ts           # Клиент для WordPress API
      seo-plugin.ts          # Утилиты для работы с SEO
      validation.ts          # Утилиты для валидации данных
      cache.ts               # Утилиты для кэширования
      retry.ts               # Утилиты для повторных попыток
      webhooks.ts            # Утилиты для вебхуков
      task-master.ts         # Адаптер для интеграции с Task Master
    /types                   # Типы TypeScript
      woocommerce.d.ts       # Типы данных WooCommerce
      wordpress.d.ts         # Типы данных WordPress
    index.ts                 # Точка входа
  .env.example               # Пример переменных окружения
  Dockerfile                 # Описание Docker-образа
  docker-compose.yml         # Конфигурация Docker Compose
```

### Запуск в режиме разработки

```bash
# Запуск с поддержкой автоматической перезагрузки
npm run dev
```

### Стиль кода и линтинг

Проект использует ESLint и Prettier для обеспечения единого стиля кода:

```bash
# Проверка стиля кода
npm run lint

# Автоматическое форматирование кода
npm run format
```

## Документация

Дополнительная документация доступна в директории `/docs`:

- [Документация по API WooCommerce v3](docs/woocommerce-api-v3.md)
- [Интеграция MCP с Task Master](docs/mcp-integration.md)

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов с отчетом о покрытии
npm run test:coverage
```

## Решение проблем

### Проблемы с подключением к WooCommerce API

1. Убедитесь, что URL магазина указан правильно и доступен
2. Проверьте ключ и секрет API
3. Убедитесь, что у ключа API достаточно прав
4. Проверьте, что API WooCommerce включен и работает

### Ошибки интеграции с Task Master

1. Проверьте доступность Task Master по указанному URL
2. Убедитесь, что API-ключ Task Master указан правильно
3. Проверьте настройки проекта и права доступа

### Логи и отладка

Для более подробной диагностики проблем, включите отладочное логирование:

```
LOG_LEVEL=debug
```

### Дополнительная помощь

Если у вас возникли проблемы, создайте issue в репозитории проекта или обратитесь к документации.

## Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).
