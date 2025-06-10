/**
 * Типы данных для WordPress REST API
 */

/** Конфигурация подключения к WordPress */
export interface WordPressConfig {
  url: string;
  username: string;
  password: string;
}

/**
 * Интерфейс записи (поста) WordPress
 */
export interface Post {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any[];
  categories: number[];
  tags: number[];
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
    replies: Array<{
      embeddable: boolean;
      href: string;
    }>;
    'version-history': Array<{
      count: number;
      href: string;
    }>;
    'predecessor-version': Array<{
      id: number;
      href: string;
    }>;
    'wp:featuredmedia': Array<{
      embeddable: boolean;
      href: string;
    }>;
    'wp:attachment': Array<{
      href: string;
    }>;
    'wp:term': Array<{
      taxonomy: string;
      embeddable: boolean;
      href: string;
    }>;
    curies: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
}

/**
 * Интерфейс страницы WordPress
 */
export interface Page extends Post {
  parent: number;
  menu_order: number;
}

/**
 * Интерфейс пользователя WordPress
 */
export interface User {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [size: string]: string;
  };
  meta: any[];
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
  };
}

/**
 * Интерфейс категории WordPress
 */
export interface Category {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: any[];
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    'wp:post_type': Array<{
      href: string;
    }>;
    curies: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
}

/**
 * Интерфейс тега WordPress
 */
export interface Tag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: any[];
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    'wp:post_type': Array<{
      href: string;
    }>;
    curies: Array<{
      name: string;
      href: string;
      templated: boolean;
    }>;
  };
}

/**
 * Интерфейс комментария WordPress
 */
export interface Comment {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_url: string;
  date: string;
  date_gmt: string;
  content: {
    rendered: string;
  };
  link: string;
  status: string;
  type: string;
  author_avatar_urls: {
    [size: string]: string;
  };
  meta: any[];
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
    up: Array<{
      embeddable: boolean;
      post_type: string;
      href: string;
    }>;
    in_reply_to: Array<{
      embeddable: boolean;
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
  };
}

/**
 * Интерфейс медиафайла WordPress
 */
export interface Media {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: string;
  ping_status: string;
  template: string;
  meta: any[];
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [size: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
    image_meta: {
      aperture: string;
      credit: string;
      camera: string;
      caption: string;
      created_timestamp: string;
      copyright: string;
      focal_length: string;
      iso: string;
      shutter_speed: string;
      title: string;
      orientation: string;
      keywords: string[];
    };
  };
  source_url: string;
  _links: {
    self: Array<{
      href: string;
    }>;
    collection: Array<{
      href: string;
    }>;
    about: Array<{
      href: string;
    }>;
    author: Array<{
      embeddable: boolean;
      href: string;
    }>;
    replies: Array<{
      embeddable: boolean;
      href: string;
    }>;
  };
}

/**
 * Интерфейс данных Yoast SEO
 */
export interface YoastSEO {
  title: string;
  description: string;
  canonical: string;
  robots: {
    index: string;
    follow: string;
    'max-snippet': string;
    'max-image-preview': string;
    'max-video-preview': string;
  };
  og_locale: string;
  og_type: string;
  og_title: string;
  og_description: string;
  og_url: string;
  og_site_name: string;
  article_publisher: string;
  article_published_time: string;
  article_modified_time: string;
  og_image: Array<{
    width: number;
    height: number;
    url: string;
    type: string;
  }>;
  twitter_card: string;
  twitter_site: string;
  schema: {
    '@context': string;
    '@graph': any[];
  };
}

/**
 * Интерфейс данных Rank Math SEO
 */
export interface RankMath {
  title: string;
  description: string;
  canonical: string;
  robots: {
    index: boolean;
    follow: boolean;
    noindex: boolean;
    nofollow: boolean;
    noarchive: boolean;
    noimageindex: boolean;
    nosnippet: boolean;
  };
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  twitter_card: string;
  keywords: string;
  focus_keyword: string;
  seo_score: number;
  readability_score: number;
  is_cornerstone: boolean;
  permalink: string;
}