import { NextRequest, NextResponse } from 'next/server';
import { completePayment } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { payment_intent_id } = await request.json();

    if (!payment_intent_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'payment_intent_id requerido' 
        },
        { status: 400 }
      );
    }

    const completedPayment = await completePayment(payment_intent_id);

    if (!completedPayment) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Pago no encontrado o ya completado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: completedPayment,
      message: 'Pago completado exitosamente'
    });
  } catch (error: any) {
    console.error('Error completing payment:', error);
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