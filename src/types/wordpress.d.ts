/**
 * Типы данных для WordPress REST API
 */

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
 * Интерфейс типа записи WordPress
 */
export interface PostType {
  capabilities: {
    [capability: string]: boolean;
  };
  description: string;
  hierarchical: boolean;
  viewable: boolean;
  labels: {
    name: string;
    singular_name: string;
    add_new: string;
    add_new_item: string;
    edit_item: string;
    new_item: string;
    view_item: string;
    view_items: string;
    search_items: string;
    not_found: string;
    not_found_in_trash: string;
    parent_item_colon: string;
    all_items: string;
    archives: string;
    attributes: string;
    insert_into_item: string;
    uploaded_to_this_item: string;
    featured_image: string;
    set_featured_image: string;
    remove_featured_image: string;
    use_featured_image: string;
    filter_items_list: string;
    items_list_navigation: string;
    items_list: string;
    item_published: string;
    item_published_privately: string;
    item_reverted_to_draft: string;
    item_scheduled: string;
    item_updated: string;
    menu_name: string;
    name_admin_bar: string;
  };
  name: string;
  slug: string;
  supports: {
    [feature: string]: boolean;
  };
  taxonomies: string[];
  rest_base: string;
  _links: {
    collection: Array<{
      href: string;
    }>;
    'wp:items': Array<{
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
 * Интерфейс таксономии WordPress
 */
export interface Taxonomy {
  capabilities: {
    [capability: string]: boolean;
  };
  description: string;
  hierarchical: boolean;
  labels: {
    name: string;
    singular_name: string;
    search_items: string;
    popular_items: string;
    all_items: string;
    parent_item: string;
    parent_item_colon: string;
    edit_item: string;
    view_item: string;
    update_item: string;
    add_new_item: string;
    new_item_name: string;
    separate_items_with_commas: string;
    add_or_remove_items: string;
    choose_from_most_used: string;
    not_found: string;
    no_terms: string;
    items_list_navigation: string;
    items_list: string;
    menu_name: string;
    name_admin_bar: string;
    item_updated: string;
    item_published: string;
  };
  name: string;
  slug: string;
  types: string[];
  rest_base: string;
  _links: {
    collection: Array<{
      href: string;
    }>;
    'wp:items': Array<{
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
 * Интерфейс статуса записи WordPress
 */
export interface Status {
  name: string;
  private: boolean;
  protected: boolean;
  public: boolean;
  queryable: boolean;
  show_in_list: boolean;
  slug: string;
  _links: {
    archives: Array<{
      href: string;
    }>;
  };
}

/**
 * Интерфейс настроек WordPress
 */
export interface Settings {
  title: string;
  description: string;
  url: string;
  email: string;
  timezone: string;
  date_format: string;
  time_format: string;
  start_of_week: number;
  language: string;
  use_smilies: boolean;
  default_category: number;
  default_post_format: string;
  posts_per_page: number;
  default_ping_status: string;
  default_comment_status: string;
}

/**
 * Интерфейс поискового запроса WordPress
 */
export interface Search {
  id: number;
  url: string;
  type: string;
  subtype: string;
  title: string;
  content: string;
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
