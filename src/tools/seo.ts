import { WordPressConfig } from '../types/wordpress';
import { createWordPressClient } from '../utils/wordpress';
import { createYoastSEOClient, createRankMathClient } from '../utils/seo-plugin';

/**
 * Создает набор инструментов для работы с SEO (Yoast и Rank Math)
 * @param config Конфигурация WordPress API
 */
export function createSEOTools(config: WordPressConfig) {
  const wpClient = createWordPressClient(config);
  const yoastClient = createYoastSEOClient(config);
  const rankMathClient = createRankMathClient(config);

  return {
    /**
     * Проверить наличие плагина Yoast SEO
     */
    async checkYoastSEO() {
      try {
        const response = await wpClient.get('plugins', { search: 'yoast seo' });
        const plugins = response.data;
        
        // Ищем активный плагин Yoast SEO
        const yoastPlugin = plugins.find((plugin: any) => 
          plugin.plugin.includes('wordpress-seo') && plugin.status === 'active'
        );
        
        return !!yoastPlugin;
      } catch (error) {
        console.error('Ошибка при проверке наличия плагина Yoast SEO:', error);
        return false;
      }
    },

    /**
     * Проверить наличие плагина Rank Math
     */
    async checkRankMath() {
      try {
        const response = await wpClient.get('plugins', { search: 'rank math' });
        const plugins = response.data;
        
        // Ищем активный плагин Rank Math
        const rankMathPlugin = plugins.find((plugin: any) => 
          plugin.plugin.includes('seo-by-rank-math') && plugin.status === 'active'
        );
        
        return !!rankMathPlugin;
      } catch (error) {
        console.error('Ошибка при проверке наличия плагина Rank Math:', error);
        return false;
      }
    },

    /**
     * Получить SEO-данные Yoast для поста/страницы
     * @param postId ID поста/страницы
     */
    async getYoastSeoPostData(postId: number) {
      try {
        const response = await yoastClient.get(`posts/${postId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении данных Yoast SEO для поста #${postId}:`, error);
        throw error;
      }
    },

    /**
     * Обновить SEO-данные Yoast для поста/страницы
     * @param postId ID поста/страницы
     * @param seoData SEO-данные для обновления
     */
    async updateYoastSeoPostData(postId: number, seoData: any) {
      try {
        const response = await yoastClient.put(`posts/${postId}`, seoData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении данных Yoast SEO для поста #${postId}:`, error);
        throw error;
      }
    },

    /**
     * Получить sitemap настройки Yoast
     */
    async getYoastSitemapSettings() {
      try {
        const response = await yoastClient.get('sitemap');
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении настроек sitemap Yoast:', error);
        throw error;
      }
    },

    /**
     * Обновить sitemap настройки Yoast
     * @param sitemapData Данные для обновления
     */
    async updateYoastSitemapSettings(sitemapData: any) {
      try {
        const response = await yoastClient.put('sitemap', sitemapData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении настроек sitemap Yoast:', error);
        throw error;
      }
    },

    /**
     * Получить SEO-данные Rank Math для поста/страницы
     * @param postId ID поста/страницы
     */
    async getRankMathPostData(postId: number) {
      try {
        const response = await rankMathClient.get(`posts/${postId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении данных Rank Math для поста #${postId}:`, error);
        throw error;
      }
    },

    /**
     * Обновить SEO-данные Rank Math для поста/страницы
     * @param postId ID поста/страницы
     * @param seoData SEO-данные для обновления
     */
    async updateRankMathPostData(postId: number, seoData: any) {
      try {
        const response = await rankMathClient.put(`posts/${postId}`, seoData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении данных Rank Math для поста #${postId}:`, error);
        throw error;
      }
    },

    /**
     * Получить общие настройки Rank Math
     */
    async getRankMathGeneralSettings() {
      try {
        const response = await rankMathClient.get('settings');
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении общих настроек Rank Math:', error);
        throw error;
      }
    },

    /**
     * Обновить общие настройки Rank Math
     * @param settingsData Данные для обновления
     */
    async updateRankMathGeneralSettings(settingsData: any) {
      try {
        const response = await rankMathClient.put('settings', settingsData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при обновлении общих настроек Rank Math:', error);
        throw error;
      }
    },

    /**
     * Получить редиректы Rank Math
     * @param params Параметры запроса
     */
    async getRankMathRedirects(params: any = {}) {
      try {
        const response = await rankMathClient.get('redirections', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении редиректов Rank Math:', error);
        throw error;
      }
    },

    /**
     * Создать редирект Rank Math
     * @param redirectData Данные редиректа
     */
    async createRankMathRedirect(redirectData: any) {
      try {
        const response = await rankMathClient.post('redirections', redirectData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании редиректа Rank Math:', error);
        throw error;
      }
    },

    /**
     * Удалить редирект Rank Math
     * @param redirectId ID редиректа
     */
    async deleteRankMathRedirect(redirectId: number) {
      try {
        const response = await rankMathClient.delete(`redirections/${redirectId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении редиректа Rank Math #${redirectId}:`, error);
        throw error;
      }
    },

    /**
     * Анализировать SEO статус с учетом используемых плагинов
     * @param url URL для анализа
     */
    async analyzeSeoStatus(url: string) {
      try {
        // Проверяем наличие плагинов
        const [hasYoast, hasRankMath] = await Promise.all([
          this.checkYoastSEO(),
          this.checkRankMath()
        ]);
        
        // Результаты анализа
        const results: any = {
          seoPlugins: {
            yoast: hasYoast,
            rankMath: hasRankMath
          },
          url,
          data: {}
        };
        
        // Используем Yoast SEO API если доступен
        if (hasYoast) {
          try {
            const urlInfo = await yoastClient.get(`url_info?url=${encodeURIComponent(url)}`);
            results.data.yoast = urlInfo.data;
          } catch (error) {
            console.error(`Ошибка при анализе SEO с помощью Yoast для URL ${url}:`, error);
            results.data.yoast = { error: 'Не удалось получить данные Yoast SEO' };
          }
        }
        
        // Используем Rank Math API если доступен
        if (hasRankMath) {
          try {
            const urlAnalysis = await rankMathClient.get(`analyzer?url=${encodeURIComponent(url)}`);
            results.data.rankMath = urlAnalysis.data;
          } catch (error) {
            console.error(`Ошибка при анализе SEO с помощью Rank Math для URL ${url}:`, error);
            results.data.rankMath = { error: 'Не удалось получить данные Rank Math' };
          }
        }
        
        return results;
      } catch (error) {
        console.error(`Ошибка при анализе SEO статуса для URL ${url}:`, error);
        throw error;
      }
    }
  };
}
