import { useAuth } from '../context/AuthContext';

// Currency configuration
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'en-EU' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', locale: 'en-GB' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', locale: 'en-IN' },
  NPR: { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', locale: 'en-US' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', locale: 'en-CA' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', locale: 'en-AU' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', locale: 'ja-JP' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', locale: 'zh-CN' }
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Get currency info
export const getCurrencyInfo = (currencyCode: CurrencyCode = 'USD') => {
  return SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
};

// Format currency amount
export const formatCurrency = (amount: number, currencyCode: CurrencyCode = 'USD') => {
  const currency = getCurrencyInfo(currencyCode);
  
  // Special handling for NPR since it may not be supported by all browsers
  if (currencyCode === 'NPR') {
    return `${currency.symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
  
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported locales
    return `${currency.symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
};

// Hook to get user's currency formatting function
export const useCurrencyFormatter = () => {
  const { user } = useAuth();
  const userCurrency = (user?.currency as CurrencyCode) || 'USD';
  
  return {
    formatCurrency: (amount: number) => formatCurrency(amount, userCurrency),
    currency: getCurrencyInfo(userCurrency),
    currencyCode: userCurrency
  };
};

// Get all supported currencies for dropdowns
export const getSupportedCurrencies = () => {
  return Object.values(SUPPORTED_CURRENCIES);
};