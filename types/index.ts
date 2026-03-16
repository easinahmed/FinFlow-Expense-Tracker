export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CRYPTO' | 'OTHER';
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';
export type RecurringFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  userId?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  note?: string;
  date: string;
  paymentMethod: PaymentMethod;
  currency: string;
  tags: string[];
  isRecurring: boolean;
  recurringFreq?: RecurringFreq;
  userId: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  userId: string;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType | 'ALL';
  categoryId?: string;
  paymentMethod?: PaymentMethod | 'ALL';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export interface Notification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'large_expense' | 'monthly_summary';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
