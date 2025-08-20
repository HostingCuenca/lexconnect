export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal' | 'oxxo';
  name: string;
  description: string;
  enabled: boolean;
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  connected: boolean;
}

// Mock payment methods configuration
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Tarjetas de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    enabled: true,
    fees: { percentage: 2.9, fixed: 3 }
  },
  {
    id: 'bank_transfer',
    type: 'bank_transfer',
    name: 'Transferencia Bancaria',
    description: 'SPEI y transferencias tradicionales',
    enabled: true,
    fees: { percentage: 1.5, fixed: 5 }
  },
  {
    id: 'paypal',
    type: 'paypal',
    name: 'PayPal',
    description: 'Pagos con cuenta PayPal',
    enabled: false,
    fees: { percentage: 3.4, fixed: 2 }
  },
  {
    id: 'oxxo',
    type: 'oxxo',
    name: 'OXXO Pay',
    description: 'Pagos en efectivo en tiendas OXXO',
    enabled: false,
    fees: { percentage: 2.5, fixed: 8 }
  }
];

// Calculate platform commission
export function calculatePlatformFee(amount: number): number {
  const platformCommission = 0.10; // 10%
  return Math.round(amount * platformCommission * 100) / 100;
}

// Calculate payment processing fee
export function calculateProcessingFee(amount: number, paymentMethodId: string): number {
  const method = paymentMethods.find(m => m.id === paymentMethodId);
  if (!method) return 0;
  
  const percentageFee = amount * (method.fees.percentage / 100);
  const totalFee = percentageFee + method.fees.fixed;
  return Math.round(totalFee * 100) / 100;
}

// Calculate net amount for lawyer
export function calculateNetAmount(amount: number, paymentMethodId: string): number {
  const platformFee = calculatePlatformFee(amount);
  const processingFee = calculateProcessingFee(amount, paymentMethodId);
  const netAmount = amount - platformFee - processingFee;
  return Math.round(netAmount * 100) / 100;
}

// Create payment intent (mock function - would integrate with Stripe)
export async function createPaymentIntent(
  amount: number,
  currency: string = 'mxn',
  serviceId: string,
  clientId: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  // This would integrate with Stripe API
  // For now, return mock data
  return {
    clientSecret: `pi_mock_${Date.now()}_secret`,
    paymentIntentId: `pi_mock_${Date.now()}`
  };
}

// Process payment completion
export async function processPaymentCompletion(
  paymentIntentId: string,
  transactionData: Partial<Transaction>
): Promise<Transaction> {
  const transaction: Transaction = {
    id: `txn_${Date.now()}`,
    clientId: transactionData.clientId || '',
    clientName: transactionData.clientName || '',
    serviceId: transactionData.serviceId || '',
    serviceName: transactionData.serviceName || '',
    amount: transactionData.amount || 0,
    currency: transactionData.currency || 'mxn',
    status: 'completed',
    paymentMethod: transactionData.paymentMethod || 'card',
    stripePaymentIntentId: paymentIntentId,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    metadata: transactionData.metadata || {}
  };

  // In production, save to database
  console.log('Transaction completed:', transaction);

  return transaction;
}

// Get transaction history
export function getTransactionHistory(userId: string): Transaction[] {
  // Mock data - in production, fetch from database
  return [
    {
      id: 'TXN-001',
      clientId: 'client_1',
      clientName: 'María García',
      serviceId: 'service_1',
      serviceName: 'Consulta Legal - Derecho Civil',
      amount: 200,
      currency: 'mxn',
      status: 'completed',
      paymentMethod: 'Tarjeta de Crédito',
      createdAt: '2024-01-15T10:00:00Z',
      completedAt: '2024-01-15T10:05:00Z'
    }
  ];
}

// Stripe configuration check
export function checkStripeConfiguration(): StripeConfig {
  return {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    connected: !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY)
  };
}