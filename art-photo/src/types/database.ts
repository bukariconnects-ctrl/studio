export type UserRole = "visitor" | "client" | "photographer" | "admin";

export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "rejected";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";
export type InvoiceStatus = "issued" | "paid" | "overdue" | "cancelled" | "refunded";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  gdpr_consent: boolean;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  base_price: number;
  duration_minutes: number;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ServiceCategory;
}

export interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  package_services?: PackageService[];
}

export interface PackageService {
  id: string;
  package_id: string;
  service_id: string;
  service?: Service;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  sku: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: ProductCategory;
  product_images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface Photographer {
  id: string;
  specialty: string | null;
  experience_years: number;
  portfolio_url: string | null;
  average_rating: number;
  total_reviews: number;
  is_available: boolean;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Booking {
  id: string;
  client_id: string | null;
  photographer_id: string | null;
  service_id: string | null;
  package_id: string | null;
  status: BookingStatus;
  booking_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  client_notes: string | null;
  admin_notes: string | null;
  total_price: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  service?: Service;
  package?: Package;
  photographer?: Photographer;
  client?: Profile;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string | null;
  service_id: string | null;
  package_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  service?: Service;
  package?: Package;
}

export interface Order {
  id: string;
  client_id: string | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  client?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  booking_id: string | null;
  order_id: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  payment_method: string | null;
  payment_date: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}
