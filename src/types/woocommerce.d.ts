/**
 * Типы данных для WooCommerce API
 */

/**
 * Тип товара
 */
export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: string;
  status: string;
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: ProductDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: ProductDimension;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: ProductCategory[];
  tags: ProductTag[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  default_attributes: ProductDefaultAttribute[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: ProductMetaData[];
}

/**
 * Интерфейс загружаемого файла товара
 */
export interface ProductDownload {
  id: string;
  name: string;
  file: string;
}

/**
 * Интерфейс размеров товара
 */
export interface ProductDimension {
  length: string;
  width: string;
  height: string;
}

/**
 * Интерфейс категории товара
 */
export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  parent?: number;
  description?: string;
  display?: string;
  image?: ProductCategoryImage;
  menu_order?: number;
  count?: number;
}

/**
 * Интерфейс изображения категории товара
 */
export interface ProductCategoryImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

/**
 * Интерфейс тега товара
 */
export interface ProductTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

/**
 * Интерфейс изображения товара
 */
export interface ProductImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

/**
 * Интерфейс атрибута товара
 */
export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

/**
 * Интерфейс термина атрибута товара
 */
export interface AttributeTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
}

/**
 * Интерфейс атрибута товара по умолчанию
 */
export interface ProductDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

/**
 * Интерфейс метаданных товара
 */
export interface ProductMetaData {
  id: number;
  key: string;
  value: any;
}

/**
 * Интерфейс вариации товара
 */
export interface ProductVariation {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  visible: boolean;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: ProductDownload[];
  download_limit: number;
  download_expiry: number;
  tax_status: string;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
  backorders: string;
  backorders_allowed: boolean;
  backordered: boolean;
  weight: string;
  dimensions: ProductDimension;
  shipping_class: string;
  shipping_class_id: number;
  image: ProductImage;
  attributes: ProductVariationAttribute[];
  menu_order: number;
  meta_data: ProductMetaData[];
}

/**
 * Интерфейс атрибута вариации товара
 */
export interface ProductVariationAttribute {
  id: number;
  name: string;
  option: string;
}

/**
 * Интерфейс заказа
 */
export interface Order {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  created_via: string;
  version: string;
  status: string;
  currency: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: OrderBilling;
  shipping: OrderShipping;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_paid_gmt: string | null;
  date_completed: string | null;
  date_completed_gmt: string | null;
  cart_hash: string;
  meta_data: OrderMetaData[];
  line_items: OrderLineItem[];
  tax_lines: OrderTaxLine[];
  shipping_lines: OrderShippingLine[];
  fee_lines: OrderFeeLine[];
  coupon_lines: OrderCouponLine[];
  refunds: OrderRefund[];
}

/**
 * Интерфейс биллинга заказа
 */
export interface OrderBilling {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

/**
 * Интерфейс доставки заказа
 */
export interface OrderShipping {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

/**
 * Интерфейс метаданных заказа
 */
export interface OrderMetaData {
  id: number;
  key: string;
  value: any;
}

/**
 * Интерфейс позиции заказа
 */
export interface OrderLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: OrderItemTax[];
  meta_data: OrderItemMetaData[];
  sku: string;
  price: number;
}

/**
 * Интерфейс налога элемента заказа
 */
export interface OrderItemTax {
  id: number;
  total: string;
  subtotal: string;
}

/**
 * Интерфейс метаданных элемента заказа
 */
export interface OrderItemMetaData {
  id: number;
  key: string;
  value: any;
  display_key: string;
  display_value: string;
}

/**
 * Интерфейс налоговой позиции заказа
 */
export interface OrderTaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  meta_data: OrderItemMetaData[];
}

/**
 * Интерфейс позиции доставки заказа
 */
export interface OrderShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id: string;
  total: string;
  total_tax: string;
  taxes: OrderItemTax[];
  meta_data: OrderItemMetaData[];
}

/**
 * Интерфейс комиссионной позиции заказа
 */
export interface OrderFeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: string;
  amount: string;
  total: string;
  total_tax: string;
  taxes: OrderItemTax[];
  meta_data: OrderItemMetaData[];
}

/**
 * Интерфейс позиции купона заказа
 */
export interface OrderCouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: OrderItemMetaData[];
}

/**
 * Интерфейс возврата заказа
 */
export interface OrderRefund {
  id: number;
  reason: string;
  total: string;
}

/**
 * Полный интерфейс возврата заказа
 */
export interface Refund {
  id: number;
  date_created: string;
  date_created_gmt: string;
  amount: string;
  reason: string;
  refunded_by: number;
  refunded_payment: boolean;
  meta_data: RefundMetaData[];
  line_items: RefundLineItem[];
  api_refund: boolean;
}

/**
 * Интерфейс метаданных возврата
 */
export interface RefundMetaData {
  id: number;
  key: string;
  value: any;
}

/**
 * Интерфейс позиции возврата
 */
export interface RefundLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: RefundItemTax[];
  meta_data: RefundItemMetaData[];
  sku: string;
  price: number;
}

/**
 * Интерфейс налога позиции возврата
 */
export interface RefundItemTax {
  id: number;
  total: string;
  subtotal: string;
}

/**
 * Интерфейс метаданных позиции возврата
 */
export interface RefundItemMetaData {
  id: number;
  key: string;
  value: any;
  display_key: string;
  display_value: string;
}

/**
 * Интерфейс примечания к заказу
 */
export interface OrderNote {
  id: number;
  author: string;
  date_created: string;
  date_created_gmt: string;
  note: string;
  customer_note: boolean;
}

/**
 * Интерфейс клиента
 */
export interface Customer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: CustomerBilling;
  shipping: CustomerShipping;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: CustomerMetaData[];
}

/**
 * Интерфейс биллинга клиента
 */
export interface CustomerBilling {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

/**
 * Интерфейс доставки клиента
 */
export interface CustomerShipping {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

/**
 * Интерфейс метаданных клиента
 */
export interface CustomerMetaData {
  id: number;
  key: string;
  value: any;
}

/**
 * Интерфейс купона
 */
export interface Coupon {
  id: number;
  code: string;
  amount: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_type: string;
  description: string;
  date_expires: string | null;
  date_expires_gmt: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  used_by: string[];
  meta_data: CouponMetaData[];
}

/**
 * Интерфейс метаданных купона
 */
export interface CouponMetaData {
  id: number;
  key: string;
  value: any;
}
