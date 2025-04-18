/**
 * Скрипт для настройки вебхуков WooCommerce для интеграции с Task Master
 */

// Загрузка переменных окружения
require('dotenv').config();

const { WebhookManager } = require('../dist/utils/webhooks');

// Конфигурация WooCommerce API
const wooConfig = {
  url: process.env.WOOCOMMERCE_URL || '',
  consumerKey: process.env.WOOCOMMERCE_KEY || '',
  consumerSecret: process.env.WOOCOMMERCE_SECRET || '',
};

// Проверка наличия необходимых переменных окружения
if (!wooConfig.url || !wooConfig.consumerKey || !wooConfig.consumerSecret) {
  console.error('Ошибка: Отсутствуют необходимые учетные данные для WooCommerce API в переменных окружения');
  process.exit(1);
}

// URL для доставки вебхуков
const baseDeliveryUrl = process.env.WEBHOOK_DELIVERY_URL || 'http://localhost:3000/webhooks';

// Секретный ключ для вебхуков
const webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';

// Асинхронная функция для настройки вебхуков
async function setupWebhooks() {
  try {
    console.log('Настройка вебхуков WooCommerce для интеграции с Task Master...');
    
    // Создание менеджера вебхуков
    const webhookManager = new WebhookManager(wooConfig, webhookSecret);
    
    // Получение текущих вебхуков
    console.log('Получение списка существующих вебхуков...');
    const existingWebhooks = await webhookManager.listWebhooks();
    console.log(`Найдено ${existingWebhooks.length} существующих вебхуков`);
    
    // Настройка вебхуков для Task Master
    console.log(`Настройка вебхуков с базовым URL: ${baseDeliveryUrl}`);
    const webhooks = await webhookManager.setupTaskMasterWebhooks(baseDeliveryUrl);
    
    console.log(`Успешно настроено ${webhooks.length} вебхуков:`);
    webhooks.forEach((webhook, index) => {
      console.log(`${index + 1}. ${webhook.name} (${webhook.topic}) -> ${webhook.delivery_url}`);
    });
    
    console.log('\nВебхуки успешно настроены!');
    console.log('Теперь WooCommerce будет отправлять уведомления о событиях на указанные URL-адреса.');
    
  } catch (error) {
    console.error('Ошибка при настройке вебхуков:', error.message);
    if (error.response) {
      console.error('Данные ответа:', error.response.data);
    }
    process.exit(1);
  }
}

// Запуск функции настройки вебхуков
setupWebhooks();
