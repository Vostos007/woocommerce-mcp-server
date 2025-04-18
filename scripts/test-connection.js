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

// URL для получения информации о магазине
const baseUrl = `${wooConfig.url}/wp-json/wc/v3/`;
const requestData = {
  url: `${baseUrl}`,
  method: 'GET'
};

// Получение заголовков авторизации
const authHeader = oauth.toHeader(oauth.authorize(requestData));

// Выполнение запроса
async function testConnection() {
  try {
    console.log('Тестирование подключения к WooCommerce API...');
    console.log(`URL: ${wooConfig.url}`);
    
    const response = await axios.get(baseUrl, {
      headers: authHeader
    });
    
    console.log('\n✅ Соединение с WooCommerce API установлено успешно!');
    console.log('\nИнформация о подключении:');
    console.log('------------------------');
    console.log(`URL: ${wooConfig.url}`);
    console.log(`API версия: wc/v3`);
    console.log(`Статус ответа: ${response.status}`);
    
    // Попытка получить информацию о магазине
    try {
      const storeResponse = await axios.get(`${baseUrl}system_status`, {
        headers: authHeader
      });
      
      console.log('\nИнформация о магазине:');
      console.log('--------------------');
      console.log(`Версия WooCommerce: ${storeResponse.data.environment.wc_version}`);
      console.log(`Версия WordPress: ${storeResponse.data.environment.wp_version}`);
      console.log(`Тема: ${storeResponse.data.theme.name} (версия ${storeResponse.data.theme.version})`);
      console.log(`Валюта: ${storeResponse.data.settings.currency}`);
    } catch (storeError) {
      console.log('\nНе удалось получить информацию о магазине:', storeError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Ошибка подключения к WooCommerce API:');
    if (error.response) {
      console.error(`Статус: ${error.response.status}`);
      console.error('Данные:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testConnection();