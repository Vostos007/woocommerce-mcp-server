# Руководство по новым инструментам WooCommerce MCP

В этом руководстве описаны новые инструменты, добавленные в WooCommerce MCP Server для расширенного управления магазином.

## Содержание

- [Атрибуты товаров](#атрибуты-товаров)
- [Теги товаров](#теги-товаров)
- [Категории товаров](#категории-товаров)
- [Купоны](#купоны)
- [Медиа-файлы](#медиа-файлы)
- [Настройки магазина](#настройки-магазина)

## Атрибуты товаров

Инструменты для работы с атрибутами товаров позволяют создавать, получать, обновлять и удалять атрибуты и их значения.

### Получение списка атрибутов

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "list_product_attributes",
  params: {
    per_page: 20
  },
  id: 1
};

// Пример ответа
{
  "jsonrpc": "2.0",
  "result": [
    {
      "id": 1,
      "name": "Цвет",
      "slug": "color",
      "type": "select",
      "order_by": "menu_order",
      "has_archives": false
    },
    {
      "id": 2,
      "name": "Размер",
      "slug": "size",
      "type": "select",
      "order_by": "menu_order",
      "has_archives": false
    }
  ],
  "id": 1
}
```

### Создание атрибута

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "create_product_attribute",
  params: {
    attributeData: {
      name: "Материал",
      slug: "material",
      type: "select",
      order_by: "menu_order",
      has_archives: false
    }
  },
  id: 1
};

// Пример ответа
{
  "jsonrpc": "2.0",
  "result": {
    "id": 3,
    "name": "Материал",
    "slug": "material",
    "type": "select",
    "order_by": "menu_order",
    "has_archives": false
  },
  "id": 1
}
```

### Работа с терминами атрибутов

Атрибуты имеют термины (значения). Их можно получать и создавать:

```javascript
// Пример получения терминов атрибута
const request = {
  jsonrpc: "2.0",
  method: "list_attribute_terms",
  params: {
    attributeId: 1
  },
  id: 1
};

// Пример создания термина атрибута
const request = {
  jsonrpc: "2.0",
  method: "create_attribute_term",
  params: {
    attributeId: 1,
    termData: {
      name: "Красный",
      slug: "red"
    }
  },
  id: 1
};
```

## Теги товаров

Инструменты для работы с тегами позволяют организовать товары и улучшить навигацию по магазину.

### Получение списка тегов

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "list_product_tags",
  params: {
    per_page: 20,
    search: "новинка"
  },
  id: 1
};
```

### Создание тега

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "create_product_tag",
  params: {
    tagData: {
      name: "Распродажа",
      slug: "sale",
      description: "Товары со скидкой"
    }
  },
  id: 1
};
```

### Назначение тегов товару

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "assign_tags_to_product",
  params: {
    productId: 123,
    tagIds: [1, 2, 3]
  },
  id: 1
};
```

## Категории товаров

Инструменты для работы с категориями позволяют структурировать каталог товаров.

### Получение иерархии категорий

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "get_category_hierarchy",
  params: {},
  id: 1
};

// Пример ответа
{
  "jsonrpc": "2.0",
  "result": [
    {
      "id": 1,
      "name": "Одежда",
      "slug": "clothing",
      "children": [
        {
          "id": 2,
          "name": "Мужская одежда",
          "slug": "mens-clothing",
          "children": []
        },
        {
          "id": 3,
          "name": "Женская одежда",
          "slug": "womens-clothing",
          "children": []
        }
      ]
    }
  ],
  "id": 1
}
```

### Получение товаров из категории

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "get_products_by_category",
  params: {
    categoryId: 2,
    per_page: 10
  },
  id: 1
};
```

## Купоны

Инструменты для работы с купонами позволяют создавать и управлять скидками.

### Создание купона

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "create_coupon",
  params: {
    couponData: {
      code: "SUMMER2025",
      discount_type: "percent",
      amount: "15",
      individual_use: true,
      exclude_sale_items: true,
      minimum_amount: "50.00",
      date_expires: "2025-09-01"
    }
  },
  id: 1
};
```

### Проверка действительности купона

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "validate_coupon",
  params: {
    code: "SUMMER2025"
  },
  id: 1
};

// Пример ответа
{
  "jsonrpc": "2.0",
  "result": {
    "valid": true,
    "coupon": {
      "id": 5,
      "code": "SUMMER2025",
      "discount_type": "percent",
      "amount": "15",
      // ...другие поля
    }
  },
  "id": 1
}
```

### Массовое создание купонов

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "create_bulk_coupons",
  params: {
    baseCode: "WELCOME",
    count: 10,
    couponTemplate: {
      discount_type: "fixed_cart",
      amount: "10.00",
      individual_use: true,
      usage_limit: 1
    }
  },
  id: 1
};
```

## Медиа-файлы

Инструменты для работы с медиа-файлами позволяют загружать и управлять изображениями товаров.

### Загрузка изображения товара

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "upload_product_image",
  params: {
    productId: 123,
    imageData: "base64_encoded_image_data",
    filename: "product-123-main.jpg",
    isFeature: true
  },
  id: 1
};
```

### Получение списка медиа-файлов

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "list_media",
  params: {
    per_page: 20
  },
  id: 1
};
```

## Настройки магазина

Инструменты для работы с настройками позволяют управлять конфигурацией магазина.

### Получение настроек

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "get_settings_group",
  params: {
    group: "general"
  },
  id: 1
};
```

### Обновление настроек валюты

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "update_currency_settings",
  params: {
    currencyCode: "USD",
    currencyPosition: "left",
    thousandSeparator: ",",
    decimalSeparator: ".",
    numDecimals: 2
  },
  id: 1
};
```

### Настройки магазина (адрес и т.д.)

```javascript
// Пример вызова
const request = {
  jsonrpc: "2.0",
  method: "update_store_settings",
  params: {
    storeName: "Мой Магазин",
    storeDescription: "Лучшие товары по лучшим ценам",
    storeAddress: "ул. Примерная, 123",
    storeCity: "Москва",
    storePostcode: "123456",
    storeCountry: "RU"
  },
  id: 1
};
```

## Дополнительные материалы

Для более подробной информации о работе с инструментами WooCommerce MCP, см.:

- [Интеграция с Task Master](./mcp-integration.md)
- [Документация по WooCommerce API](./woocommerce-api-v3.md)
