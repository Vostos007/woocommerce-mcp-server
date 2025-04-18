# WooCommerce REST API v3 Documentation

WooCommerce предоставляет REST API, которое позволяет разработчикам взаимодействовать с данными магазина программным путем. Этот документ содержит краткий обзор возможностей API WooCommerce v3.

## Основная информация

- **Базовый URL:** `https://{your-domain}/wp-json/wc/v3`
- **Авторизация:** OAuth 1.0a или JWT Authentication (для плагинов)
- **Формат данных:** JSON
- **Версия API:** v3 (последняя стабильная на 2025 год)

## Основные эндпоинты

### Товары

```
GET /products - Получить список товаров
GET /products/{id} - Получить информацию о товаре
POST /products - Создать товар
PUT /products/{id} - Обновить товар
DELETE /products/{id} - Удалить товар
```

### Вариации товаров

```
GET /products/{product_id}/variations - Получить список вариаций
GET /products/{product_id}/variations/{id} - Получить информацию о вариации
POST /products/{product_id}/variations - Создать вариацию
PUT /products/{product_id}/variations/{id} - Обновить вариацию
DELETE /products/{product_id}/variations/{id} - Удалить вариацию
```

### Категории товаров

```
GET /products/categories - Получить список категорий
GET /products/categories/{id} - Получить информацию о категории
POST /products/categories - Создать категорию
PUT /products/categories/{id} - Обновить категорию
DELETE /products/categories/{id} - Удалить категорию
```

### Атрибуты товаров

```
GET /products/attributes - Получить список атрибутов
GET /products/attributes/{id} - Получить информацию об атрибуте
POST /products/attributes - Создать атрибут
PUT /products/attributes/{id} - Обновить атрибут
DELETE /products/attributes/{id} - Удалить атрибут

GET /products/attributes/{attribute_id}/terms - Получить термины атрибута
GET /products/attributes/{attribute_id}/terms/{id} - Получить информацию о термине
POST /products/attributes/{attribute_id}/terms - Создать термин
PUT /products/attributes/{attribute_id}/terms/{id} - Обновить термин
DELETE /products/attributes/{attribute_id}/terms/{id} - Удалить термин
```

### Заказы

```
GET /orders - Получить список заказов
GET /orders/{id} - Получить информацию о заказе
POST /orders - Создать заказ
PUT /orders/{id} - Обновить заказ
DELETE /orders/{id} - Удалить заказ
```

### Примечания к заказам

```
GET /orders/{order_id}/notes - Получить примечания к заказу
GET /orders/{order_id}/notes/{id} - Получить информацию о примечании
POST /orders/{order_id}/notes - Создать примечание
DELETE /orders/{order_id}/notes/{id} - Удалить примечание
```

### Возвраты

```
GET /orders/{order_id}/refunds - Получить возвраты заказа
GET /orders/{order_id}/refunds/{id} - Получить информацию о возврате
POST /orders/{order_id}/refunds - Создать возврат
DELETE /orders/{order_id}/refunds/{id} - Удалить возврат
```

### Клиенты

```
GET /customers - Получить список клиентов
GET /customers/{id} - Получить информацию о клиенте
POST /customers - Создать клиента
PUT /customers/{id} - Обновить клиента
DELETE /customers/{id} - Удалить клиента
```

### Купоны

```
GET /coupons - Получить список купонов
GET /coupons/{id} - Получить информацию о купоне
POST /coupons - Создать купон
PUT /coupons/{id} - Обновить купон
DELETE /coupons/{id} - Удалить купон
```

### Отчеты

```
GET /reports - Получить список отчетов
GET /reports/sales - Получить отчет по продажам
GET /reports/top_sellers - Получить отчет по самым продаваемым товарам
GET /reports/coupons/totals - Получить общую информацию по купонам
GET /reports/customers/totals - Получить общую информацию по клиентам
GET /reports/orders/totals - Получить общую информацию по заказам
GET /reports/products/totals - Получить общую информацию по товарам
GET /reports/reviews/totals - Получить общую информацию по отзывам
```

## Параметры для GET запросов

Все эндпоинты, возвращающие списки элементов, поддерживают следующие параметры:

| Параметр | Тип | Описание |
|----------|------|------------|
| `context` | string | Объем возвращаемых данных. Варианты: `view` и `edit`. По умолчанию `view`. |
| `page` | integer | Текущая страница. |
| `per_page` | integer | Количество элементов на странице. По умолчанию 10. Максимум 100. |
| `search` | string | Строка поиска. |
| `after` | string/date-time | Ограничение ответа элементами, созданными после указанной даты. |
| `before` | string/date-time | Ограничение ответа элементами, созданными до указанной даты. |
| `exclude` | array | Исключить элементы с указанными ID. |
| `include` | array | Ограничить ответ элементами с указанными ID. |
| `order` | string | Порядок сортировки. Варианты: `asc` и `desc`. По умолчанию `desc`. |
| `orderby` | string | Поле для сортировки. По умолчанию `date`. |

## Аутентификация

WooCommerce REST API использует OAuth 1.0a для аутентификации:

1. Создайте ключи API в админ-панели WooCommerce (WooCommerce > Настройки > Дополнительно > REST API).
2. Используйте ключи для аутентификации запросов.

### Пример запроса с аутентификацией

```javascript
const WooCommerceRestApi = require('@woocommerce/woocommerce-rest-api').default;

const api = new WooCommerceRestApi({
  url: 'https://example.com',
  consumerKey: 'consumer_key',
  consumerSecret: 'consumer_secret',
  version: 'wc/v3'
});

// Получение списка товаров
api.get('products')
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
```

## Пагинация

API использует пагинацию для больших списков данных. В заголовках ответа содержится информация о пагинации:

- `X-WP-Total`: Общее количество элементов.
- `X-WP-TotalPages`: Общее количество страниц.

Для перемещения между страницами используйте параметры `page` и `per_page`.

## Обработка ошибок

API возвращает стандартные HTTP-коды состояния:

- `200 OK`: Запрос выполнен успешно.
- `201 Created`: Ресурс успешно создан.
- `400 Bad Request`: Неверный запрос, ошибка клиента.
- `401 Unauthorized`: Ошибка аутентификации.
- `404 Not Found`: Ресурс не найден.
- `500 Internal Server Error`: Ошибка сервера.

В случае ошибки, API также возвращает JSON-объект с деталями:

```json
{
  "code": "rest_invalid_param",
  "message": "Invalid parameter(s): name",
  "data": {
    "status": 400,
    "params": {
      "name": "Название товара обязательно"
    }
  }
}
```

## Вебхуки

WooCommerce позволяет создавать вебхуки для получения уведомлений о событиях:

```
GET /webhooks - Получить список вебхуков
GET /webhooks/{id} - Получить информацию о вебхуке
POST /webhooks - Создать вебхук
PUT /webhooks/{id} - Обновить вебхук
DELETE /webhooks/{id} - Удалить вебхук
```

### Темы вебхуков

- `coupon.created` - Создание купона
- `coupon.updated` - Обновление купона
- `coupon.deleted` - Удаление купона
- `customer.created` - Создание клиента
- `customer.updated` - Обновление клиента
- `customer.deleted` - Удаление клиента
- `order.created` - Создание заказа
- `order.updated` - Обновление заказа
- `order.deleted` - Удаление заказа
- `product.created` - Создание товара
- `product.updated` - Обновление товара
- `product.deleted` - Удаление товара

## Дополнительная информация

Для получения более подробной информации об API WooCommerce, посетите [официальную документацию](https://woocommerce.github.io/woocommerce-rest-api-docs/).
