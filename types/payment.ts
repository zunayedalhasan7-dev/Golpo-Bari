export interface IBkashToken {
  _id?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface ITransaction {
  _id?: string;
  transactionId: string;
  paymentId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bkashStatusCode?: string;
  bkashStatusMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  paymentCreateTime: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  bkashURL: string;
  callbackURL: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  createTime: string;
  updateTime: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
  customerMsisdn: string;
  statusCode: string;
  statusMessage: string;
}
