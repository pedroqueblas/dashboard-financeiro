export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO date string
  week?: number; // For variable income (1, 2, 3, 4)
  isFixed?: boolean; // For fixed income
  paymentMethod?: "credit" | "debit" | "pix";
  installments?: number; // Total number of installments
  currentInstallment?: number; // Current installment number
}

export interface Investment {
  id: string;
  name: string;
  type: "fixed" | "variable";
  amount: number;
  date: string;
}

export interface StockPosition {
  id: string;
  ticker: string;
  quantity: number;
  averagePrice: number;
  date: string;
}

export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  marketCap: number;
  volume: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  averageDailyVolume3Month: number;
  averageDailyVolume10Day: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  priceEarnings: number;
  earningsPerShare: number;
  logourl?: string;
}


export interface MonthSummary {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
