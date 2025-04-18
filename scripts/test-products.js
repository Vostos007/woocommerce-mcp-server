import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

// Загрузка переменных окружения
dotenv.config();

// WooCommerce API конфигурация
const wooConfig = {
  url: process.env.WOOCOMMERCE_URL || '',
  consumerKey: process.env.WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.WOOCOMMERCE_SECRET || '',
};

// Проверка необходимых переменных окружения
if (!wooConfig.url || !wooConfig.consumerKey || !wooConfig.consumerSecret) {
  console.error('Отсутствуют необходимые учетные данные для WooCommerce API в переменных окружения');
  process.exit(1);
}

// Создание OAuth объекта
const oauth = OAuth({
  consumer: {
    key: wooConfig.consumerKey,
    secret: wooConfig.consumerSecret
  },
  signature_method: 'HMAC-SHA256',
  hash_function(base_string, key) {
    return crypto.createHmac('sha256', key)
      .update(base_string)
      .digest('base64');
  }
});

// URL для получения списка товаров
const productsUrl = `${wooConfig.url}/wp-json/wc/v3/products`;
const requestData = {
  url: productsUrl,
  method: 'GET'
};

// Получение заголовков авторизации
const authHeader = oauth.toHeader(oauth.authorize(requestData));

// Выполнение запроса для получения списка товаров
async function testProductsAPI() {
  try {
    console.log('Тестирование WooCommerce API для работы с товарами...');
    
    // Получение списка товаров
    const response = await axios.get(productsUrl, {
      headers: authHeader,
      params: {
        per_page: 5
      }
    });
    
    console.log('\n✅ Успешно получен список товаров!');
    console.log(`Общее количество товаров: ${response.headers['x-wp-total'] || 'Неизвестно'}`);
    console.log('\nСписок товаров:');
    console.log('-------------');
    
    response.data.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Цена: ${product.price || 'Не указана'} ${product.currency || ''}`);
      console.log(`   Статус: ${product.status}`);
      console.log(`   Создан: ${new Date(product.date_created).toLocaleString()}`);
      console.log(`   URL: ${product.permalink}`);
      console.log('-------------');
    });
    
    // Получение категорий товаров
    const categoriesUrl = `${wooConfig.url}/wp-json/wc/v3/products/categories`;
    const categoriesRequestData = {
      url: categoriesUrl,
      method: 'GET'
    };
    const categoriesAuthHeader = oauth.toHeader(oauth.authorize(categoriesRequestData));
    
    const categoriesResponse = await axios.get(categoriesUrl, {
      headers: categoriesAuthHeader,
      params: {
        per_page: 5
      }
    });
    
    console.log('\n✅ Успешно получен список категорий товаров!');
    console.log(`Общее количество категорий: ${categoriesResponse.headers['x-wp-total'] || 'Неизвестно'}`);
    console.log('\nСписок категорий:');
    console.log('-------------');
    
    categoriesResponse.data.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Товаров: ${category.count}`);
      console.log(`   Slug: ${category.slug}`);
      console.log('-------------');
    });
    
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании API товаров:');
    if (error.response) {
      console.error(`Статус: ${error.response.status}`);
      console.error('Данные:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testProductsAPI();