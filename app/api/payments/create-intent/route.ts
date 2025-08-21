import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { createPaymentIntent } from '@/lib/payments';

// Helper to verify authentication
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    
    // Only clients can create payment intents
    if (user.role !== 'cliente') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los clientes pueden crear pagos' 
        },
        { status: 403 }
      );
    }

    const { consultation_id, amount, payment_method } = await request.json();

    if (!consultation_id || !amount || !payment_method) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Faltan campos requeridos: consultation_id, amount, payment_method' 
        },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(consultation_id, amount, payment_method);

    return NextResponse.json({
      success: true,
      data: paymentIntent,
      message: 'Payment intent creado exitosamente'
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        message: error.message 
      },
      { status: 500 }
    );
  }
}