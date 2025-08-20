import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { amount, serviceId, clientId, currency = 'mxn' } = await request.json();

    if (!amount || !serviceId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount, currency, serviceId, clientId);

    return NextResponse.json(paymentIntent);
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}