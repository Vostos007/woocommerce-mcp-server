import { WordPressConfig } from '../types/wordpress';
import { createWordPressClient } from '../utils/wordpress';

/**
 * Создает набор инструментов для работы со статьями WordPress
 * @param config Конфигурация WordPress API
 */
export function createPostTools(config: WordPressConfig) {
  const wpClient = createWordPressClient(config);

  return {
    /**
     * Получить список статей
     * @param params Параметры запроса
     */
    async listPosts(params: any = {}) {
      try {
        const response = await wpClient.get('posts', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка статей:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретной статье
     * @param id ID статьи
     */
    async getPost(id: number) {
      try {
        const response = await wpClient.get(`posts/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о статье #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новую статью
     * @param postData Данные статьи
     */
    async createPost(postData: any) {
      try {
        const response = await wpClient.post('posts', postData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании статьи:', error);
        throw error;
      }
    },

    /**
     * Обновить существующую статью
     * @param id ID статьи
     * @param postData Данные для обновления
     */
    async updatePost(id: number, postData: any) {
      try {
        const response = await wpClient.put(`posts/${id}`, postData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении статьи #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить статью
     * @param id ID статьи
     * @param force Принудительное удаление
     */
    async deletePost(id: number, force: boolean = false) {
      try {
        const response = await wpClient.delete(`posts/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении статьи #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список категорий
     * @param params Параметры запроса
     */
    async listCategories(params: any = {}) {
      try {
        const response = await wpClient.get('categories', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка категорий:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретной категории
     * @param id ID категории
     */
    async getCategory(id: number) {
      try {
        const response = await wpClient.get(`categories/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новую категорию
     * @param categoryData Данные категории
     */
    async createCategory(categoryData: any) {
      try {
        const response = await wpClient.post('categories', categoryData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании категории:', error);
        throw error;
      }
    },

    /**
     * Обновить существующую категорию
     * @param id ID категории
     * @param categoryData Данные для обновления
     */
    async updateCategory(id: number, categoryData: any) {
      try {
        const response = await wpClient.put(`categories/${id}`, categoryData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить категорию
     * @param id ID категории
     * @param force Принудительное удаление
     */
    async deleteCategory(id: number, force: boolean = false) {
      try {
        const response = await wpClient.delete(`categories/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении категории #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список тегов
     * @param params Параметры запроса
     */
    async listTags(params: any = {}) {
      try {
        const response = await wpClient.get('tags', params);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка тегов:', error);
        throw error;
      }
    },

    /**
     * Получить информацию о конкретном теге
     * @param id ID тега
     */
    async getTag(id: number) {
      try {
        const response = await wpClient.get(`tags/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении информации о теге #${id}:`, error);
        throw error;
      }
    },

    /**
     * Создать новый тег
     * @param tagData Данные тега
     */
    async createTag(tagData: any) {
      try {
        const response = await wpClient.post('tags', tagData);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании тега:', error);
        throw error;
      }
    },

    /**
     * Обновить существующий тег
     * @param id ID тега
     * @param tagData Данные для обновления
     */
    async updateTag(id: number, tagData: any) {
      try {
        const response = await wpClient.put(`tags/${id}`, tagData);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении тега #${id}:`, error);
        throw error;
      }
    },

    /**
     * Удалить тег
     * @param id ID тега
     * @param force Принудительное удаление
     */
    async deleteTag(id: number, force: boolean = false) {
      try {
        const response = await wpClient.delete(`tags/${id}`, { force });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при удалении тега #${id}:`, error);
        throw error;
      }
    },

    /**
     * Получить список комментариев к статье
     * @param postId ID статьи
     * @param params Параметры запроса
     */
    async listComments(postId: number, params: any = {}) {
      try {
        const commentParams = {
          ...params,
          post: postId
        };
        const response = await wpClient.get('comments', commentParams);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении комментариев к статье #${postId}:`, error);
        throw error;
      }
    }
  };
}
