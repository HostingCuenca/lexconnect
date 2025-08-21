import 'server-only';
import { query, withTransaction, PoolClient } from './database';

// Payment interface matching schema.sql
export interface Payment {
  id: string;
  consultation_id: string;
  client_id: string;
  lawyer_id: string;
  amount: number;
  platform_fee: number;
  lawyer_earnings: number;
  currency: string;
  payment_method: string;
  payment_intent_id?: string;
  status: 'pendiente' | 'procesando' | 'completado' | 'fallido' | 'reembolsado';
  paid_at?: string;
  created_at: string;
}

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

export interface CreatePaymentData {
  consultation_id: string;
  amount: number;
  payment_method: string;
  currency?: string;
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

// Create payment for consultation
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  return withTransaction(async (client: PoolClient) => {
    // Get consultation details
    const consultationResult = await client.query(`
      SELECT c.*, lp.id as lawyer_profile_id 
      FROM consultations c
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      WHERE c.id = $1
    `, [data.consultation_id]);
    
    if (consultationResult.rows.length === 0) {
      throw new Error('Consulta no encontrada');
    }
    
    const consultation = consultationResult.rows[0];
    const platformFee = calculatePlatformFee(data.amount);
    const processingFee = calculateProcessingFee(data.amount, data.payment_method);
    const lawyerEarnings = data.amount - platformFee - processingFee;
    
    const result = await client.query(`
      INSERT INTO payments (
        consultation_id, client_id, lawyer_id, amount, platform_fee, 
        lawyer_earnings, currency, payment_method, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      data.consultation_id,
      consultation.client_id,
      consultation.lawyer_id,
      data.amount,
      platformFee,
      lawyerEarnings,
      data.currency || 'MXN',
      data.payment_method,
      'pendiente'
    ]);

    return result.rows[0];
  });
}

// Simulate payment intent creation (prepared for real Stripe integration)
export async function createPaymentIntent(
  consultationId: string,
  amount: number,
  paymentMethod: string
): Promise<{ clientSecret: string; paymentIntentId: string; payment: Payment }> {
  // Create payment record in database
  const payment = await createPayment({
    consultation_id: consultationId,
    amount,
    payment_method: paymentMethod,
    currency: 'MXN'
  });

  // TODO: Replace with real Stripe integration
  const mockPaymentIntent = {
    clientSecret: `pi_mock_${Date.now()}_secret`,
    paymentIntentId: `pi_mock_${Date.now()}`
  };

  // Update payment with intent ID
  await query(`
    UPDATE payments 
    SET payment_intent_id = $1, status = 'procesando'
    WHERE id = $2
  `, [mockPaymentIntent.paymentIntentId, payment.id]);

  return {
    ...mockPaymentIntent,
    payment: { ...payment, payment_intent_id: mockPaymentIntent.paymentIntentId, status: 'procesando' }
  };
}

// Complete payment (simulate successful payment)
export async function completePayment(paymentIntentId: string): Promise<Payment | null> {
  return withTransaction(async (client: PoolClient) => {
    const result = await client.query(`
      UPDATE payments 
      SET status = 'completado', paid_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = $1 AND status = 'procesando'
      RETURNING *
    `, [paymentIntentId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Here you would typically trigger lawyer payout process
    console.log('Payment completed:', result.rows[0]);

    return result.rows[0];
  });
}

// Get payment by consultation ID
export async function getPaymentByConsultationId(consultationId: string): Promise<Payment | null> {
  try {
    const result = await query(`
      SELECT * FROM payments WHERE consultation_id = $1 ORDER BY created_at DESC LIMIT 1
    `, [consultationId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
}

// Get payments for user (client or lawyer)
export async function getUserPayments(userId: string, userRole: string): Promise<Payment[]> {
  try {
    let queryText;
    if (userRole === 'cliente') {
      queryText = 'SELECT * FROM payments WHERE client_id = $1 ORDER BY created_at DESC';
    } else if (userRole === 'abogado') {
      queryText = 'SELECT * FROM payments WHERE lawyer_id = $1 ORDER BY created_at DESC';
    } else {
      queryText = 'SELECT * FROM payments ORDER BY created_at DESC';
    }
    
    const result = await query(queryText, userRole === 'administrador' ? [] : [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
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