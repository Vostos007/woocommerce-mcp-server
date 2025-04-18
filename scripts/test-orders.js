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

// URL для получения списка заказов
const ordersUrl = `${wooConfig.url}/wp-json/wc/v3/orders`;
const requestData = {
  url: ordersUrl,
  method: 'GET'
};

// Получение заголовков авторизации
const authHeader = oauth.toHeader(oauth.authorize(requestData));

// Выполнение запроса для получения списка заказов
async function testOrdersAPI() {
  try {
    console.log('Тестирование WooCommerce API для работы с заказами...');
    
    // Получение списка заказов
    const response = await axios.get(ordersUrl, {
      headers: authHeader,
      params: {
        per_page: 5
      }
    });
    
    console.log('\n✅ Успешно получен список заказов!');
    console.log(`Общее количество заказов: ${response.headers['x-wp-total'] || 'Неизвестно'}`);
    console.log('\nСписок заказов:');
    console.log('-------------');
    
    if (response.data.length === 0) {
      console.log('Заказы не найдены.');
    } else {
      response.data.forEach((order, index) => {
        console.log(`${index + 1}. Заказ #${order.number}`);
        console.log(`   ID: ${order.id}`);
        console.log(`   Статус: ${order.status}`);
        console.log(`   Дата создания: ${new Date(order.date_created).toLocaleString()}`);
        console.log(`   Клиент: ${order.billing?.first_name} ${order.billing?.last_name}`);
        console.log(`   Email: ${order.billing?.email || 'Не указан'}`);
        console.log(`   Сумма: ${order.total} ${order.currency}`);
        console.log(`   Товаров: ${order.line_items?.length || 0}`);
        console.log('-------------');
      });
    }
    
    // Получение статусов заказов
    const statusesUrl = `${wooConfig.url}/wp-json/wc/v3/reports/orders/totals`;
    const statusesRequestData = {
      url: statusesUrl,
      method: 'GET'
    };
    const statusesAuthHeader = oauth.toHeader(oauth.authorize(statusesRequestData));
    
    try {
      const statusesResponse = await axios.get(statusesUrl, {
        headers: statusesAuthHeader
      });
      
      console.log('\n✅ Успешно получена статистика по статусам заказов!');
      console.log('\nСтатистика по статусам:');
      console.log('-------------');
      
      statusesResponse.data.forEach((status) => {
        console.log(`${status.slug}: ${status.total}`);
      });
      console.log('-------------');
    } catch (statusError) {
      console.log('\nНе удалось получить статистику по статусам заказов:', statusError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка при тестировании API заказов:');
    if (error.response) {
      console.error(`Статус: ${error.response.status}`);
      console.error('Данные:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testOrdersAPI();