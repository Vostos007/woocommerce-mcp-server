import WordPressClient from './wordpress';

/**
 * Класс для работы с SEO-плагинами WordPress (Yoast SEO и Rank Math)
 */
export default class SeoPluginUtil {
  private wordpress: WordPressClient;

  /**
   * Создает экземпляр утилиты для работы с SEO-плагинами
   * @param client Клиент WordPress API
   */
  constructor(client: WordPressClient) {
    this.wordpress = client;
  }

  /**
   * Проверяет, активен ли Yoast SEO
   */
  public async isYoastSeoActive(): Promise<boolean> {
    try {
      // Проверяем наличие конечной точки Yoast SEO
      await this.wordpress.get('yoast/v1/meta');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Проверяет, активен ли Rank Math
   */
  public async isRankMathActive(): Promise<boolean> {
    try {
      // Проверяем наличие конечной точки Rank Math
      await this.wordpress.get('rankmath/v1/meta');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получает SEO-данные Yoast для записи/страницы
   * @param postId ID записи/страницы
   */
  public async getYoastSeoPostData(postId: number): Promise<any> {
    try {
      // Получаем мета-данные Yoast для записи
      const response = await this.wordpress.get(`yoast/v1/meta/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных Yoast SEO:', error);
      throw new Error('Не удалось получить данные Yoast SEO');
    }
  }

  /**
   * Обновляет SEO-данные Yoast для записи/страницы
   * @param postId ID записи/страницы
   * @param seoData Данные SEO для обновления
   */
  public async updateYoastSeoPostData(postId: number, seoData: any): Promise<any> {
    try {
      // Получаем запись для обновления
      const post = await this.wordpress.get(`posts/${postId}`);
      
      // Обновляем мета-данные Yoast через обновление записи
      const metaData = post.data.meta || {};
      const yoastMeta = {
        ...metaData,
        '_yoast_wpseo_title': seoData.title,
        '_yoast_wpseo_metadesc': seoData.meta_description,
        '_yoast_wpseo_focuskw': seoData.focus_keyword,
        '_yoast_wpseo_metakeywords': seoData.metakeywords
      };
      
      // Обновляем запись с новыми мета-данными
      const response = await this.wordpress.put(`posts/${postId}`, {
        meta: yoastMeta
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении данных Yoast SEO:', error);
      throw new Error('Не удалось обновить данные Yoast SEO');
    }
  }

  /**
   * Получает SEO-данные Rank Math для записи/страницы
   * @param postId ID записи/страницы
   */
  public async getRankMathPostData(postId: number): Promise<any> {
    try {
      // Получаем мета-данные Rank Math для записи
      const response = await this.wordpress.get(`rankmath/v1/meta/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных Rank Math:', error);
      throw new Error('Не удалось получить данные Rank Math');
    }
  }

  /**
   * Обновляет SEO-данные Rank Math для записи/страницы
   * @param postId ID записи/страницы
   * @param seoData Данные SEO для обновления
   */
  public async updateRankMathPostData(postId: number, seoData: any): Promise<any> {
    try {
      // Получаем запись для обновления
      const post = await this.wordpress.get(`posts/${postId}`);
      
      // Обновляем мета-данные Rank Math через обновление записи
      const metaData = post.data.meta || {};
      const rankMathMeta = {
        ...metaData,
        'rank_math_title': seoData.title,
        'rank_math_description': seoData.description,
        'rank_math_focus_keyword': seoData.focus_keyword
      };
      
      // Добавляем вторичные ключевые слова, если они есть
      if (seoData.secondary_keywords) {
        rankMathMeta['rank_math_secondary_keywords'] = seoData.secondary_keywords;
      }
      
      // Обновляем запись с новыми мета-данными
      const response = await this.wordpress.put(`posts/${postId}`, {
        meta: rankMathMeta
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении данных Rank Math:', error);
      throw new Error('Не удалось обновить данные Rank Math');
    }
  }

  /**
   * Получает общие настройки Yoast SEO
   */
  public async getYoastSeoSettings(): Promise<any> {
    try {
      const response = await this.wordpress.get('yoast/v1/configuration');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении настроек Yoast SEO:', error);
      throw new Error('Не удалось получить настройки Yoast SEO');
    }
  }

  /**
   * Получает общие настройки Rank Math
   */
  public async getRankMathSettings(): Promise<any> {
    try {
      const response = await this.wordpress.get('rankmath/v1/settings');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении настроек Rank Math:', error);
      throw new Error('Не удалось получить настройки Rank Math');
    }
  }

  /**
   * Получает данные sitemap из Yoast SEO
   */
  public async getYoastSeoSitemap(): Promise<any> {
    try {
      const response = await this.wordpress.get('yoast/v1/sitemap');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных sitemap Yoast SEO:', error);
      throw new Error('Не удалось получить данные sitemap Yoast SEO');
    }
  }

  /**
   * Получает данные sitemap из Rank Math
   */
  public async getRankMathSitemap(): Promise<any> {
    try {
      const response = await this.wordpress.get('rankmath/v1/sitemap');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных sitemap Rank Math:', error);
      throw new Error('Не удалось получить данные sitemap Rank Math');
    }
  }

  /**
   * Получает настройки редиректов Yoast SEO Premium
   */
  public async getYoastRedirects(): Promise<any> {
    try {
      const response = await this.wordpress.get('yoast/v1/redirects');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении редиректов Yoast SEO:', error);
      throw new Error('Не удалось получить редиректы Yoast SEO или Yoast SEO Premium не установлен');
    }
  }

  /**
   * Создает редирект в Yoast SEO Premium
   * @param redirectData Данные редиректа
   */
  public async createYoastRedirect(redirectData: any): Promise<any> {
    try {
      const response = await this.wordpress.post('yoast/v1/redirects', redirectData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании редиректа Yoast SEO:', error);
      throw new Error('Не удалось создать редирект Yoast SEO или Yoast SEO Premium не установлен');
    }
  }

  /**
   * Получает настройки редиректов Rank Math
   */
  public async getRankMathRedirects(): Promise<any> {
    try {
      const response = await this.wordpress.get('rankmath/v1/redirections');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении редиректов Rank Math:', error);
      throw new Error('Не удалось получить редиректы Rank Math');
    }
  }

  /**
   * Создает редирект в Rank Math
   * @param redirectData Данные редиректа
   */
  public async createRankMathRedirect(redirectData: any): Promise<any> {
    try {
      const response = await this.wordpress.post('rankmath/v1/redirections', redirectData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании редиректа Rank Math:', error);
      throw new Error('Не удалось создать редирект Rank Math');
    }
  }

  /**
   * Получает анализ SEO Yoast для записи/страницы
   * @param postId ID записи/страницы
   */
  public async getYoastSeoAnalysis(postId: number): Promise<any> {
    try {
      const response = await this.wordpress.get(`yoast/v1/analysis/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении анализа Yoast SEO:', error);
      throw new Error('Не удалось получить анализ Yoast SEO');
    }
  }

  /**
   * Получает анализ SEO Rank Math для записи/страницы
   * @param postId ID записи/страницы
   */
  public async getRankMathAnalysis(postId: number): Promise<any> {
    try {
      const response = await this.wordpress.get(`rankmath/v1/analysis/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении анализа Rank Math:', error);
      throw new Error('Не удалось получить анализ Rank Math');
    }
  }
}