import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
}

export function maskCardNumber(cardNumber: string): string {
  return `.... .... .... ${cardNumber.slice(-4)}`;
}

export function generateReference(): string {
  return `CRT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
}

export function generateAccountNumber(): string {
  return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
}
