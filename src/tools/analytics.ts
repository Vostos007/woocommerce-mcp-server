import { WooCommerceConfig } from '../types/woocommerce';
import { createWooCommerceClient } from '../utils/woocommerce';

/**
 * Создает набор инструментов для работы с аналитикой
 * @param config Конфигурация WooCommerce API
 */
export function createAnalyticsTools(config: WooCommerceConfig) {
  const wooClient = createWooCommerceClient(config);

  return {
    /**
     * Получить отчет по продажам
     * @param params Параметры запроса
     */
    async getSalesReport(params: any = {}) {
      try {
        const response = await wooClient.get('reports/sales', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по продажам:', error);
        throw error;
      }
    },

    /**
     * Получить отчет по самым продаваемым товарам
     * @param params Параметры запроса
     */
    async getTopSellingProducts(params: any = {}) {
      try {
        const response = await wooClient.get('reports/top_sellers', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по самым продаваемым товарам:', error);
        throw error;
      }
    },

    /**
     * Получить данные о доходах по датам
     * @param startDate Начальная дата (YYYY-MM-DD)
     * @param endDate Конечная дата (YYYY-MM-DD)
     */
    async getRevenueByDate(startDate: string, endDate: string) {
      try {
        const params = {
          date_min: startDate,
          date_max: endDate,
          period: 'custom'
        };
        const response = await wooClient.get('reports/sales', params);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении данных о доходах с ${startDate} по ${endDate}:`, error);
        throw error;
      }
    },

    /**
     * Получить количество заказов по статусам
     */
    async getOrderCountByStatus() {
      try {
        const response = await wooClient.get('reports/orders/totals');
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении количества заказов по статусам:', error);
        throw error;
      }
    },

    /**
     * Получить отчет по клиентам
     * @param params Параметры запроса
     */
    async getCustomersReport(params: any = {}) {
      try {
        const response = await wooClient.get('reports/customers', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по клиентам:', error);
        throw error;
      }
    },

    /**
     * Получить отчет по категориям товаров
     * @param params Параметры запроса
     */
    async getCategoriesReport(params: any = {}) {
      try {
        const response = await wooClient.get('reports/categories', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по категориям товаров:', error);
        throw error;
      }
    },

    /**
     * Получить отчет по купонам
     * @param params Параметры запроса
     */
    async getCouponsReport(params: any = {}) {
      try {
        const response = await wooClient.get('reports/coupons', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по купонам:', error);
        throw error;
      }
    },

    /**
     * Получить отчет по налогам
     * @param params Параметры запроса
     */
    async getTaxesReport(params: any = {}) {
      try {
        const response = await wooClient.get('reports/taxes', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении отчета по налогам:', error);
        throw error;
      }
    },

    /**
     * Получить обзор продаж за определенный период
     * @param period Период (week, month, year, custom)
     * @param startDate Начальная дата при period='custom'
     * @param endDate Конечная дата при period='custom'
     */
    async getSalesOverview(period: string = 'month', startDate?: string, endDate?: string) {
      try {
        const params: any = { period };
        
        if (period === 'custom' && startDate && endDate) {
          params.date_min = startDate;
          params.date_max = endDate;
        }
        
        // Получаем все необходимые отчеты
        const [salesReport, topSellers, orderStatuses] = await Promise.all([
          this.getSalesReport(params),
          this.getTopSellingProducts(params),
          this.getOrderCountByStatus()
        ]);
        
        return {
          sales: salesReport,
          topProducts: topSellers,
          orderStatuses: orderStatuses
        };
      } catch (error) {
        console.error(`Ошибка при получении обзора продаж за период ${period}:`, error);
        throw error;
      }
    },

    /**
     * Получить данные о продажах по дням недели
     * @param startDate Начальная дата (YYYY-MM-DD)
     * @param endDate Конечная дата (YYYY-MM-DD)
     */
    async getSalesByDayOfWeek(startDate: string, endDate: string) {
      try {
        // Получаем данные по продажам с разбивкой по дням
        const params = {
          date_min: startDate,
          date_max: endDate,
          period: 'day'
        };
        
        const salesData = await this.getSalesReport(params);
        
        // Считаем сумму продаж по дням недели
        const salesByDay: { [key: string]: number } = {
          'Monday': 0,
          'Tuesday': 0,
          'Wednesday': 0,
          'Thursday': 0,
          'Friday': 0,
          'Saturday': 0,
          'Sunday': 0
        };
        
        for (const day of salesData) {
          const date = new Date(day.date);
          const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
          salesByDay[dayOfWeek] += parseFloat(day.total_sales);
        }
        
        return salesByDay;
      } catch (error) {
        console.error(`Ошибка при получении данных о продажах по дням недели с ${startDate} по ${endDate}:`, error);
        throw error;
      }
    }
  };
}
