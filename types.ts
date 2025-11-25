export type Territory = 'Australia' | 'New Zealand';

export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export interface QuoteDetails {
  territory: Territory;
  category: string;
  subCategory: string;
  unitType: 'Per 30s' | 'Per Track' | 'Flat Fee' | 'Per Episode';
  quantity: number;
  ratePerUnit: number;
  discount?: number;
  discountLabel?: string;
  netAmount: number;
  gstAmount: number;
  processingFee: number;
  totalAmount: number;
  currency: 'AUD' | 'NZD';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  isThinking?: boolean;
  quote?: QuoteDetails; // If the message contains a generated quote
  timestamp: Date;
}

export enum ProcessingStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  ERROR = 'error'
}