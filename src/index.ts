import { createServer, JsonRpcTransport } from '@modelcontextprotocol/server';
import { createProductTools } from './tools/products';
import { createOrderTools } from './tools/orders';
import { createCustomerTools } from './tools/customers';
import { createAnalyticsTools } from './tools/analytics';
import { createPostTools } from './tools/posts';
import { createSEOTools } from './tools/seo';
import { createCategoryTools } from './tools/categories';
import { createTagTools } from './tools/tags';
import { createAttributeTools } from './tools/attributes';
import { createCouponTools } from './tools/coupons';
import { createSettingsTools } from './tools/settings';
import { createMediaTools } from './tools/media';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// WooCommerce API конфигурация
const wooConfig = {
  url: process.env.WOOCOMMERCE_URL || '',
  consumerKey: process.env.WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.WOOCOMMERCE_SECRET || '',
};

// WordPress API конфигурация
const wpConfig = {
  url: process.env.WOOCOMMERCE_URL || '', // Используем тот же URL, что и для WooCommerce
  username: process.env.WORDPRESS_USERNAME || '',
  password: process.env.WORDPRESS_PASSWORD || '',
};

// Проверка необходимых переменных окружения
if (!wooConfig.url || !wooConfig.consumerKey || !wooConfig.consumerSecret) {
  console.error('Отсутствуют необходимые учетные данные для WooCommerce API в переменных окружения');
  process.exit(1);
}

// Создание инструментов
const productTools = createProductTools(wooConfig);
const orderTools = createOrderTools(wooConfig);
const customerTools = createCustomerTools(wooConfig);
const analyticsTools = createAnalyticsTools(wooConfig);
const categoryTools = createCategoryTools(wooConfig);
const tagTools = createTagTools(wooConfig);
const attributeTools = createAttributeTools(wooConfig);
const couponTools = createCouponTools(wooConfig);
const settingsTools = createSettingsTools(wooConfig);

// WordPress инструменты требуют дополнительных учетных данных
let postTools;
let seoTools;
let mediaTools;

if (wpConfig.username && wpConfig.password) {
  postTools = createPostTools(wpConfig);
  seoTools = createSEOTools(wpConfig);
  mediaTools = createMediaTools({
    ...wpConfig,
    consumerKey: wooConfig.consumerKey,
    consumerSecret: wooConfig.consumerSecret
  });
}

// Создание MCP-сервера
const server = createServer({
  // Информация о сервере
  info: {
    name: 'woocommerce-mcp-server',
    version: '1.0.0',
    description: 'MCP-сервер для управления магазином WooCommerce',
  },
  
  // Определение ресурсов
  resources: {
    'woocommerce-store-info': {
      description: 'Информация о магазине WooCommerce',
      content: async () => {
        try {
          const client = createProductTools(wooConfig);
          const store = await client.listProducts({ per_page: 1 });
          return `# WooCommerce Store

URL: ${wooConfig.url}
API Version: wc/v3
Products: Available for management
Orders: Available for management
Customers: Available for management
Analytics: Available for reporting

## Capabilities
This MCP server allows you to manage all aspects of your WooCommerce store, including products, orders, customers, and more.`;
        } catch (error) {
          return `Error connecting to WooCommerce store: ${error.message}`;
        }
      }
    },
    
    'woocommerce-api-docs': {
      description: 'Документация по WooCommerce API',
      content: `# WooCommerce API Documentation

This MCP server provides tools for interacting with your WooCommerce store.

## Products
- List, get, create, update, and delete products
- Manage product categories, tags, and attributes
- Handle product variations
- Work with product reviews

## Orders
- List, get, create, update, and delete orders
- Manage order notes and refunds

## Customers
- List, get, create, update, and delete customers
- Manage customer metadata

## Analytics
- Get sales, products, and customer reports
- Analyze top selling products
- View revenue by date

## WordPress Posts (if credentials provided)
- Manage blog posts and pages
- Work with categories and tags
- Handle SEO metadata (Yoast/Rank Math)

For more information, please refer to the official WooCommerce REST API documentation:
https://woocommerce.github.io/woocommerce-rest-api-docs/
`
    }
  },
  
  // Определение инструментов
  tools: {
    // ---------------------------
    // Инструменты для товаров
    // ---------------------------
    list_products: {
      description: 'Получить список товаров в магазине WooCommerce',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество товаров на странице' },
        category: { type: 'number', description: 'Фильтр по ID категории' },
        tag: { type: 'number', description: 'Фильтр по ID тега' },
        status: { type: 'string', description: 'Статус товара (publish, draft, etc.)' },
        featured: { type: 'boolean', description: 'Показывать только избранные товары' },
        sku: { type: 'string', description: 'Фильтр по SKU' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => productTools.listProducts(params)
    },
    
    get_product: {
      description: 'Получить информацию о конкретном товаре по ID',
      parameters: {
        id: { type: 'number', description: 'ID товара', required: true }
      },
      execute: async (params) => productTools.getProduct(params.id)
    },
    
    create_product: {
      description: 'Создать новый товар',
      parameters: {
        productData: { 
          type: 'object', 
          description: 'Данные товара', 
          required: true 
        }
      },
      execute: async (params) => productTools.createProduct(params.productData)
    },
    
    update_product: {
      description: 'Обновить существующий товар',
      parameters: {
        id: { type: 'number', description: 'ID товара', required: true },
        productData: { 
          type: 'object', 
          description: 'Данные для обновления товара', 
          required: true 
        }
      },
      execute: async (params) => productTools.updateProduct(params.id, params.productData)
    },
    
    delete_product: {
      description: 'Удалить товар',
      parameters: {
        id: { type: 'number', description: 'ID товара', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление без корзины' }
      },
      execute: async (params) => productTools.deleteProduct(params.id, params.force)
    },
    
    // Категории товаров
    list_product_categories: {
      description: 'Получить список категорий товаров',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество категорий на странице' },
        parent: { type: 'number', description: 'Фильтр по родительской категории' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => categoryTools.listProductCategories(params)
    },
    
    get_product_category: {
      description: 'Получить информацию о конкретной категории товаров по ID',
      parameters: {
        id: { type: 'number', description: 'ID категории', required: true }
      },
      execute: async (params) => categoryTools.getProductCategory(params.id)
    },
    
    create_product_category: {
      description: 'Создать новую категорию товаров',
      parameters: {
        categoryData: { 
          type: 'object', 
          description: 'Данные категории', 
          required: true 
        }
      },
      execute: async (params) => categoryTools.createProductCategory(params.categoryData)
    },
    
    update_product_category: {
      description: 'Обновить существующую категорию товаров',
      parameters: {
        id: { type: 'number', description: 'ID категории', required: true },
        categoryData: { 
          type: 'object', 
          description: 'Данные для обновления категории', 
          required: true 
        }
      },
      execute: async (params) => categoryTools.updateProductCategory(params.id, params.categoryData)
    },
    
    delete_product_category: {
      description: 'Удалить категорию товаров',
      parameters: {
        id: { type: 'number', description: 'ID категории', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => categoryTools.deleteProductCategory(params.id, params.force)
    },
    
    // Вариации товаров
    list_product_variations: {
      description: 'Получить список вариаций товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество вариаций на странице' }
      },
      execute: async (params) => productTools.listProductVariations(params.productId, {
        page: params.page,
        per_page: params.per_page
      })
    },
    
    get_product_variation: {
      description: 'Получить информацию о конкретной вариации товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        variationId: { type: 'number', description: 'ID вариации', required: true }
      },
      execute: async (params) => productTools.getProductVariation(params.productId, params.variationId)
    },
    
    create_product_variation: {
      description: 'Создать новую вариацию товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        variationData: { 
          type: 'object', 
          description: 'Данные вариации', 
          required: true 
        }
      },
      execute: async (params) => productTools.createProductVariation(params.productId, params.variationData)
    },
    
    update_product_variation: {
      description: 'Обновить существующую вариацию товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        variationId: { type: 'number', description: 'ID вариации', required: true },
        variationData: { 
          type: 'object', 
          description: 'Данные для обновления вариации', 
          required: true 
        }
      },
      execute: async (params) => productTools.updateProductVariation(params.productId, params.variationId, params.variationData)
    },
    
    delete_product_variation: {
      description: 'Удалить вариацию товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        variationId: { type: 'number', description: 'ID вариации', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => productTools.deleteProductVariation(params.productId, params.variationId, params.force)
    },
    
    // Теги товаров
    list_product_tags: {
      description: 'Получить список тегов товаров',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество тегов на странице' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => tagTools.listProductTags(params)
    },
    
    get_product_tag: {
      description: 'Получить информацию о конкретном теге товара',
      parameters: {
        id: { type: 'number', description: 'ID тега', required: true }
      },
      execute: async (params) => tagTools.getProductTag(params.id)
    },
    
    create_product_tag: {
      description: 'Создать новый тег товара',
      parameters: {
        tagData: { 
          type: 'object', 
          description: 'Данные тега', 
          required: true 
        }
      },
      execute: async (params) => tagTools.createProductTag(params.tagData)
    },
    
    update_product_tag: {
      description: 'Обновить существующий тег товара',
      parameters: {
        id: { type: 'number', description: 'ID тега', required: true },
        tagData: { 
          type: 'object', 
          description: 'Данные для обновления тега', 
          required: true 
        }
      },
      execute: async (params) => tagTools.updateProductTag(params.id, params.tagData)
    },
    
    delete_product_tag: {
      description: 'Удалить тег товара',
      parameters: {
        id: { type: 'number', description: 'ID тега', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => tagTools.deleteProductTag(params.id, params.force)
    },
    
    // Атрибуты товаров
    list_product_attributes: {
      description: 'Получить список атрибутов товаров',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество атрибутов на странице' }
      },
      execute: async (params) => attributeTools.listProductAttributes(params)
    },
    
    get_product_attribute: {
      description: 'Получить информацию о конкретном атрибуте товара',
      parameters: {
        id: { type: 'number', description: 'ID атрибута', required: true }
      },
      execute: async (params) => attributeTools.getProductAttribute(params.id)
    },
    
    create_product_attribute: {
      description: 'Создать новый атрибут товара',
      parameters: {
        attributeData: { 
          type: 'object', 
          description: 'Данные атрибута', 
          required: true 
        }
      },
      execute: async (params) => attributeTools.createProductAttribute(params.attributeData)
    },
    
    update_product_attribute: {
      description: 'Обновить существующий атрибут товара',
      parameters: {
        id: { type: 'number', description: 'ID атрибута', required: true },
        attributeData: { 
          type: 'object', 
          description: 'Данные для обновления атрибута', 
          required: true 
        }
      },
      execute: async (params) => attributeTools.updateProductAttribute(params.id, params.attributeData)
    },
    
    delete_product_attribute: {
      description: 'Удалить атрибут товара',
      parameters: {
        id: { type: 'number', description: 'ID атрибута', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => attributeTools.deleteProductAttribute(params.id, params.force)
    },
    
    // Купоны
    list_coupons: {
      description: 'Получить список купонов',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество купонов на странице' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => couponTools.listCoupons(params)
    },
    
    get_coupon: {
      description: 'Получить информацию о конкретном купоне',
      parameters: {
        id: { type: 'number', description: 'ID купона', required: true }
      },
      execute: async (params) => couponTools.getCoupon(params.id)
    },
    
    create_coupon: {
      description: 'Создать новый купон',
      parameters: {
        couponData: { 
          type: 'object', 
          description: 'Данные купона', 
          required: true 
        }
      },
      execute: async (params) => couponTools.createCoupon(params.couponData)
    },
    
    update_coupon: {
      description: 'Обновить существующий купон',
      parameters: {
        id: { type: 'number', description: 'ID купона', required: true },
        couponData: { 
          type: 'object', 
          description: 'Данные для обновления купона', 
          required: true 
        }
      },
      execute: async (params) => couponTools.updateCoupon(params.id, params.couponData)
    },
    
    delete_coupon: {
      description: 'Удалить купон',
      parameters: {
        id: { type: 'number', description: 'ID купона', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => couponTools.deleteCoupon(params.id, params.force)
    },
    
    // Настройки
    get_settings_group: {
      description: 'Получить настройки для определенной группы',
      parameters: {
        group: { type: 'string', description: 'ID группы настроек', required: true }
      },
      execute: async (params) => settingsTools.getSettingsGroup(params.group)
    },
    
    update_setting: {
      description: 'Обновить значение настройки',
      parameters: {
        group: { type: 'string', description: 'ID группы настроек', required: true },
        id: { type: 'string', description: 'ID настройки', required: true },
        value: { type: 'any', description: 'Новое значение', required: true }
      },
      execute: async (params) => settingsTools.updateSetting(params.group, params.id, params.value)
    },
    
    // ---------------------------
    // Инструменты для заказов
    // ---------------------------
    list_orders: {
      description: 'Получить список заказов в магазине WooCommerce',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество заказов на странице' },
        status: { type: 'string', description: 'Фильтр по статусу заказа' },
        customer: { type: 'number', description: 'Фильтр по ID клиента' },
        product: { type: 'number', description: 'Фильтр по ID товара' },
        after: { type: 'string', description: 'Фильтр по дате после (формат: YYYY-MM-DD)' },
        before: { type: 'string', description: 'Фильтр по дате до (формат: YYYY-MM-DD)' }
      },
      execute: async (params) => orderTools.listOrders(params)
    },
    
    get_order: {
      description: 'Получить информацию о конкретном заказе по ID',
      parameters: {
        id: { type: 'number', description: 'ID заказа', required: true }
      },
      execute: async (params) => orderTools.getOrder(params.id)
    },
    
    create_order: {
      description: 'Создать новый заказ',
      parameters: {
        orderData: { 
          type: 'object', 
          description: 'Данные заказа', 
          required: true 
        }
      },
      execute: async (params) => orderTools.createOrder(params.orderData)
    },
    
    update_order: {
      description: 'Обновить существующий заказ',
      parameters: {
        id: { type: 'number', description: 'ID заказа', required: true },
        orderData: { 
          type: 'object', 
          description: 'Данные для обновления заказа', 
          required: true 
        }
      },
      execute: async (params) => orderTools.updateOrder(params.id, params.orderData)
    },
    
    delete_order: {
      description: 'Удалить заказ',
      parameters: {
        id: { type: 'number', description: 'ID заказа', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => orderTools.deleteOrder(params.id, params.force)
    },
    
    // ---------------------------
    // Инструменты для клиентов
    // ---------------------------
    list_customers: {
      description: 'Получить список клиентов в магазине WooCommerce',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество клиентов на странице' },
        search: { type: 'string', description: 'Поисковый запрос' },
        email: { type: 'string', description: 'Фильтр по email' },
        role: { type: 'string', description: 'Фильтр по роли' }
      },
      execute: async (params) => customerTools.listCustomers(params)
    },
    
    get_customer: {
      description: 'Получить информацию о конкретном клиенте по ID',
      parameters: {
        id: { type: 'number', description: 'ID клиента', required: true }
      },
      execute: async (params) => customerTools.getCustomer(params.id)
    },
    
    create_customer: {
      description: 'Создать нового клиента',
      parameters: {
        customerData: { 
          type: 'object', 
          description: 'Данные клиента', 
          required: true 
        }
      },
      execute: async (params) => customerTools.createCustomer(params.customerData)
    },
    
    update_customer: {
      description: 'Обновить существующего клиента',
      parameters: {
        id: { type: 'number', description: 'ID клиента', required: true },
        customerData: { 
          type: 'object', 
          description: 'Данные для обновления клиента', 
          required: true 
        }
      },
      execute: async (params) => customerTools.updateCustomer(params.id, params.customerData)
    },
    
    delete_customer: {
      description: 'Удалить клиента',
      parameters: {
        id: { type: 'number', description: 'ID клиента', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => customerTools.deleteCustomer(params.id, params.force)
    },
    
    // ---------------------------
    // Инструменты для аналитики
    // ---------------------------
    get_sales_report: {
      description: 'Получить отчет по продажам',
      parameters: {
        period: { 
          type: 'string', 
          description: 'Период отчета (week, month, year)',
          enum: ['week', 'month', 'year', 'custom']
        },
        date_min: { type: 'string', description: 'Начальная дата (YYYY-MM-DD)' },
        date_max: { type: 'string', description: 'Конечная дата (YYYY-MM-DD)' }
      },
      execute: async (params) => analyticsTools.getSalesReport(params)
    },
    
    get_top_selling_products: {
      description: 'Получить список самых продаваемых товаров',
      parameters: {
        period: { 
          type: 'string', 
          description: 'Период отчета (week, month, year)',
          enum: ['week', 'month', 'year', 'custom'] 
        },
        limit: { type: 'number', description: 'Количество товаров для возврата' }
      },
      execute: async (params) => analyticsTools.getTopSellingProducts(params)
    },
    
    get_revenue_by_date: {
      description: 'Получить данные о доходах по датам',
      parameters: {
        startDate: { type: 'string', description: 'Начальная дата (YYYY-MM-DD)', required: true },
        endDate: { type: 'string', description: 'Конечная дата (YYYY-MM-DD)', required: true }
      },
      execute: async (params) => analyticsTools.getRevenueByDate(params.startDate, params.endDate)
    },
    
    get_order_count_by_status: {
      description: 'Получить количество заказов по статусам',
      parameters: {},
      execute: async () => analyticsTools.getOrderCountByStatus()
    }
  }
});

// Добавляем WordPress-инструменты, если предоставлены учетные данные
if (postTools && seoTools && mediaTools) {
  // Инструменты для статей WordPress
  server.extendTools({
    // ---------------------------
    // Инструменты для статей
    // ---------------------------
    list_posts: {
      description: 'Получить список статей в WordPress',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество статей на странице' },
        status: { type: 'string', description: 'Статус статьи (publish, draft, etc.)' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => postTools.listPosts(params)
    },
    
    get_post: {
      description: 'Получить информацию о конкретной статье по ID',
      parameters: {
        id: { type: 'number', description: 'ID статьи', required: true }
      },
      execute: async (params) => postTools.getPost(params.id)
    },
    
    create_post: {
      description: 'Создать новую статью',
      parameters: {
        postData: { 
          type: 'object', 
          description: 'Данные статьи', 
          required: true 
        }
      },
      execute: async (params) => postTools.createPost(params.postData)
    },
    
    update_post: {
      description: 'Обновить существующую статью',
      parameters: {
        id: { type: 'number', description: 'ID статьи', required: true },
        postData: { 
          type: 'object', 
          description: 'Данные для обновления статьи', 
          required: true 
        }
      },
      execute: async (params) => postTools.updatePost(params.id, params.postData)
    },
    
    delete_post: {
      description: 'Удалить статью',
      parameters: {
        id: { type: 'number', description: 'ID статьи', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => postTools.deletePost(params.id, params.force)
    },
    
    // ---------------------------
    // Инструменты для SEO
    // ---------------------------
    get_yoast_seo_post_data: {
      description: 'Получить SEO-данные Yoast для поста/страницы',
      parameters: {
        postId: { type: 'number', description: 'ID поста/страницы', required: true }
      },
      execute: async (params) => seoTools.getYoastSeoPostData(params.postId)
    },
    
    update_yoast_seo_post_data: {
      description: 'Обновить SEO-данные Yoast для поста/страницы',
      parameters: {
        postId: { type: 'number', description: 'ID поста/страницы', required: true },
        seoData: { 
          type: 'object', 
          description: 'SEO-данные для обновления', 
          required: true 
        }
      },
      execute: async (params) => seoTools.updateYoastSeoPostData(params.postId, params.seoData)
    },
    
    get_rank_math_post_data: {
      description: 'Получить SEO-данные Rank Math для поста/страницы',
      parameters: {
        postId: { type: 'number', description: 'ID поста/страницы', required: true }
      },
      execute: async (params) => seoTools.getRankMathPostData(params.postId)
    },
    
    update_rank_math_post_data: {
      description: 'Обновить SEO-данные Rank Math для поста/страницы',
      parameters: {
        postId: { type: 'number', description: 'ID поста/страницы', required: true },
        seoData: { 
          type: 'object', 
          description: 'SEO-данные для обновления', 
          required: true 
        }
      },
      execute: async (params) => seoTools.updateRankMathPostData(params.postId, params.seoData)
    },
    
    // ---------------------------
    // Инструменты для медиа
    // ---------------------------
    list_media: {
      description: 'Получить список медиа-файлов',
      parameters: {
        page: { type: 'number', description: 'Номер страницы' },
        per_page: { type: 'number', description: 'Количество медиа-файлов на странице' },
        search: { type: 'string', description: 'Поисковый запрос' }
      },
      execute: async (params) => mediaTools.listMedia(params)
    },
    
    get_media: {
      description: 'Получить информацию о конкретном медиа-файле',
      parameters: {
        id: { type: 'number', description: 'ID медиа-файла', required: true }
      },
      execute: async (params) => mediaTools.getMedia(params.id)
    },
    
    upload_media_from_base64: {
      description: 'Загрузить медиа-файл из base64-строки',
      parameters: {
        base64Data: { type: 'string', description: 'Base64-строка с данными файла', required: true },
        filename: { type: 'string', description: 'Имя файла', required: true },
        mimeType: { type: 'string', description: 'MIME-тип файла', required: true },
        title: { type: 'string', description: 'Заголовок медиа-файла' },
        altText: { type: 'string', description: 'Альтернативный текст' }
      },
      execute: async (params) => mediaTools.uploadMediaFromBase64(
        params.base64Data,
        params.filename,
        params.mimeType,
        params.title,
        null, // caption
        params.altText
      )
    },
    
    update_media: {
      description: 'Обновить метаданные медиа-файла',
      parameters: {
        id: { type: 'number', description: 'ID медиа-файла', required: true },
        mediaData: { 
          type: 'object', 
          description: 'Данные для обновления', 
          required: true 
        }
      },
      execute: async (params) => mediaTools.updateMedia(params.id, params.mediaData)
    },
    
    delete_media: {
      description: 'Удалить медиа-файл',
      parameters: {
        id: { type: 'number', description: 'ID медиа-файла', required: true },
        force: { type: 'boolean', description: 'Принудительное удаление' }
      },
      execute: async (params) => mediaTools.deleteMedia(params.id, params.force)
    },
    
    upload_product_image: {
      description: 'Загрузить изображение товара',
      parameters: {
        productId: { type: 'number', description: 'ID товара', required: true },
        imageData: { type: 'string', description: 'Base64-строка с данными изображения', required: true },
        filename: { type: 'string', description: 'Имя файла', required: true },
        isFeature: { type: 'boolean', description: 'Установить как основное изображение' }
      },
      execute: async (params) => mediaTools.uploadProductImage(
        params.productId,
        params.imageData,
        params.filename,
        true, // isBase64
        params.isFeature
      )
    }
  });
} else {
  console.warn('WordPress API учетные данные не предоставлены. WordPress-инструменты будут недоступны.');
}

// Использование JSON-RPC транспорта для стандартного ввода/вывода
const transport = new JsonRpcTransport();
server.useTransport(transport);

console.error('WooCommerce MCP-сервер запущен и готов к использованию');
