# WooCommerce MCP Server

Сервер MCP (Model Context Protocol) для управления магазином WooCommerce. Этот сервер предоставляет инструменты для взаимодействия с WooCommerce API и WordPress API через единый интерфейс.

## Возможности

- Управление товарами и их вариациями
- Управление заказами
- Управление клиентами
- Получение аналитических данных
- Работа с категориями и тегами товаров
- Работа с атрибутами товаров
- Управление купонами
- Настройка магазина WooCommerce
- Работа со статьями WordPress
- Управление SEO-данными (поддержка Yoast SEO и Rank Math)

## Требования

- Node.js 14.0 или выше
- Магазин на WooCommerce с настроенным REST API
- Учетные данные для API WooCommerce (Consumer Key и Consumer Secret)
- Для работы с WordPress и SEO: учетные данные WordPress

## Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/Vostos007/woocommerce-mcp-server.git
cd woocommerce-mcp-server
```

2. Установите зависимости:

```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example` и укажите ваши данные:

```bash
cp .env.example .env
```

4. Отредактируйте файл `.env` и укажите ваши учетные данные для WooCommerce API и WordPress.

## Запуск сервера

```bash
npm start
```

## Использование с клиентами MCP

После запуска сервер может быть использован с любым клиентом, поддерживающим протокол MCP, включая Claude или другие AI-ассистенты.
