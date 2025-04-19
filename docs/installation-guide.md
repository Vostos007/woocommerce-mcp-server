# Руководство по установке и использованию WooCommerce MCP Server

В этом руководстве подробно описаны процессы установки, настройки и использования WooCommerce MCP Server для управления вашим интернет-магазином.

## Содержание

- [Требования](#требования)
- [Процесс установки](#процесс-установки)
- [Настройка окружения](#настройка-окружения)
- [Запуск сервера](#запуск-сервера)
- [Интерфейсы взаимодействия](#интерфейсы-взаимодействия)
- [Использование с IDE](#использование-с-ide)
- [Решение проблем](#решение-проблем)

## Требования

Перед установкой убедитесь, что ваша система соответствует следующим требованиям:

- **Node.js**: версия 16.x или выше
- **npm**: версия 7.x или выше
- **WooCommerce**: версия 3.5+ с настроенным REST API
- **WordPress**: с доступом к учетной записи (опционально, для работы с постами и SEO)
- **Redis**: (опционально) для кэширования и повышения производительности

## Процесс установки

### Установка без Docker

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/Vostos007/woocommerce-mcp-server.git

# 2. Перейдите в папку проекта
cd woocommerce-mcp-server

# 3. Установите зависимости
npm install

# 4. Создайте файл .env из примера
cp .env.example .env

# 5. Соберите проект
npm run build
```

### Установка с использованием Docker

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/Vostos007/woocommerce-mcp-server.git
cd woocommerce-mcp-server

# 2. Создайте файл .env из примера
cp .env.example .env
# Отредактируйте файл .env вашими данными

# 3. Запуск с помощью Docker Compose
docker-compose up -d
```

## Настройка окружения

### Получение ключей WooCommerce API

1. Перейдите в админ-панель WooCommerce → Настройки → Дополнительно → REST API
2. Нажмите "Добавить ключ"
3. Введите описание (например, "MCP Server") и выберите уровень доступа "Чтение/Запись"
4. Нажмите "Создать ключ API"
5. Запишите полученные Consumer Key и Consumer Secret

### Настройка переменных окружения

Отредактируйте файл `.env` и заполните следующие обязательные переменные:

```
# WooCommerce API конфигурация
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_KEY=your_consumer_key
WOOCOMMERCE_SECRET=your_consumer_secret

# Настройки сервера
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

Для работы с WordPress-контентом (статьи, SEO):

```
# WordPress API конфигурация (опционально)
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_PASSWORD=your_wordpress_password
```

### Настройка интеграции с Task Master

Если вы планируете интегрировать WooCommerce MCP Server с Task Master, настройте соответствующие переменные:

```
# Настройки Task Master для интеграции
TASK_MASTER_URL=http://your-task-master-url
TASK_MASTER_API_KEY=your-task-master-api-key
```

## Запуск сервера

### Локальный запуск для разработки

```bash
# Запуск в режиме разработки с автоматической перезагрузкой
npm run dev
```

### Запуск в production-режиме

```bash
# Запуск собранного проекта
npm start
```

### Использование Docker в производственной среде

```bash
# Сборка производственного образа
docker build -t woocommerce-mcp-server:latest .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env woocommerce-mcp-server:latest
```

## Интерфейсы взаимодействия

WooCommerce MCP Server поддерживает JSON-RPC для взаимодействия с клиентами.

### Базовая структура запроса

```javascript
{
  "jsonrpc": "2.0",
  "method": "method_name",
  "params": {
    // Параметры метода
  },
  "id": 1
}
```

### Пример запроса с использованием curl

```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "method": "list_products",
  "params": {
    "per_page": 10
  },
  "id": 1
}' http://localhost:3000
```

### Пример запроса с использованием JavaScript

```javascript
fetch('http://localhost:3000', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "list_products",
    params: {
      per_page: 10
    },
    id: 1
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## Использование с IDE

Вы можете использовать WooCommerce MCP Server с различными IDE для более удобного управления магазином.

### Настройка VSCode для работы с MCP

1. Установите расширение "REST Client" для VSCode
2. Создайте файл `woocommerce.http` в проекте со следующим содержимым:

```http
@baseUrl = http://localhost:3000

### Получить список товаров
POST {{baseUrl}}
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "list_products",
  "params": {
    "per_page": 10
  },
  "id": 1
}

### Создать товар
POST {{baseUrl}}
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "create_product",
  "params": {
    "productData": {
      "name": "Новый товар",
      "type": "simple",
      "regular_price": "19.99",
      "description": "Описание товара"
    }
  },
  "id": 2
}
```

3. Используйте кнопку "Send Request" над каждым запросом для отправки запроса

### Настройка IntelliJ IDEA / Cursor

1. Установите плагин "HTTP Client" (встроен в Ultimate версию или доступен как плагин)
2. Создайте файл `api-requests.http` аналогично примеру для VSCode
3. Отправляйте запросы с помощью зеленой кнопки рядом с запросом

### Использование Postman

1. Создайте новую коллекцию "WooCommerce MCP"
2. Добавьте новый запрос:
   - Метод: POST
   - URL: http://localhost:3000
   - Body: raw, JSON
   - Содержимое: JSON-RPC запрос (как в примерах выше)

## Решение проблем

### Ошибка подключения к WooCommerce API

**Симптом**: Сервер не может подключиться к WooCommerce API, выдает ошибку аутентификации.

**Решение**:
1. Проверьте корректность URL магазина в `.env` (без слеша в конце)
2. Убедитесь, что Consumer Key и Consumer Secret указаны правильно
3. Проверьте, что ключ API имеет достаточные права доступа
4. Проверьте доступность WooCommerce API (https://your-store.com/wp-json/wc/v3)

### Проблемы с запуском сервера

**Симптом**: Сервер не запускается, выдает ошибки.

**Решение**:
1. Убедитесь, что все зависимости установлены: `npm install`
2. Проверьте, что проект собран: `npm run build`
3. Проверьте наличие необходимых переменных в `.env`
4. Включите детальное логирование: `LOG_LEVEL=debug` в `.env`

### Ошибки в процессе работы

**Симптом**: Сервер работает, но некоторые методы выдают ошибки.

**Решение**:
1. Проверьте формат передаваемых параметров
2. Проверьте журналы сервера для определения причины ошибки
3. Используйте опцию отладки: `NODE_ENV=development` в `.env`

## Дополнительные материалы

Для более подробной информации см.:

- [Документация по новым инструментам](./new-tools-guide.md)
- [Интеграция с Task Master](./mcp-integration.md)
- [Документация по WooCommerce API](./woocommerce-api-v3.md)
