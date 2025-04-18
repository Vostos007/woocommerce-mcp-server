import { z } from 'zod';

// WooCommerce API параметры
export const listProductsParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  category: z.number().int().positive().optional(),
  tag: z.number().int().positive().optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  sku: z.string().optional(),
  search: z.string().optional()
});

export const productDataSchema = z.object({
  name: z.string().min(1, "Название товара обязательно"),
  type: z.string().optional(),
  status: z.enum(["draft", "pending", "private", "publish"]).optional(),
  featured: z.boolean().optional(),
  catalog_visibility: z.enum(["visible", "catalog", "search", "hidden"]).optional(),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().optional(),
  regular_price: z.string().optional(),
  sale_price: z.string().optional(),
  virtual: z.boolean().optional(),
  downloadable: z.boolean().optional(),
  categories: z.array(
    z.object({
      id: z.number().int().positive()
    })
  ).optional(),
  tags: z.array(
    z.object({
      id: z.number().int().positive()
    })
  ).optional(),
  images: z.array(
    z.object({
      src: z.string().url(),
      alt: z.string().optional()
    })
  ).optional()
});

export const listOrdersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  status: z.string().optional(),
  customer: z.number().int().positive().optional(),
  product: z.number().int().positive().optional(),
  after: z.string().optional(),
  before: z.string().optional()
});

export const orderDataSchema = z.object({
  status: z.enum([
    "pending", "processing", "on-hold", "completed", 
    "cancelled", "refunded", "failed", "trash"
  ]).optional(),
  customer_id: z.number().int().positive().optional(),
  customer_note: z.string().optional(),
  billing: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    company: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  shipping: z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    company: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional()
  }).optional(),
  line_items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
      variation_id: z.number().int().optional()
    })
  ).optional()
});

export const listCustomersParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  per_page: z.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional()
});

export const customerDataSchema = z.object({
  email: z.string().email(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6).optional(),
  billing: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional()
  }).optional(),
  shipping: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company: z.string().optional(),
    address_1: z.string().optional(),
    address_2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional()
  }).optional()
});

// Вспомогательные функции для валидации
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        "Ошибка валидации данных", 
        error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      );
    }
    throw error;
  }
};

// Пользовательские ошибки для улучшенной обработки
export class ValidationError extends Error {
  details: string;
  
  constructor(message: string, details: string) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}
