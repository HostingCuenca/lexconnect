import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { query } from '@/lib/database';

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
    
    // Only admins can create test payments
    if (user.role !== 'administrador') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los administradores pueden crear pagos de prueba' 
        },
        { status: 403 }
      );
    }

    // Get existing consultations
    const consultationsResult = await query(`
      SELECT c.id, c.client_id, c.lawyer_id, c.title
      FROM consultations c
      LIMIT 3
    `);

    if (consultationsResult.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No hay consultas disponibles para crear pagos de prueba' 
        },
        { status: 400 }
      );
    }

    const createdPayments = [];

    for (const consultation of consultationsResult.rows) {
      const amount = Math.floor(Math.random() * 1000) + 500; // Random amount between 500-1500
      const platformFee = Math.round(amount * 0.10 * 100) / 100; // 10%
      const processingFee = Math.round(amount * 0.029 * 100) / 100; // 2.9%
      const lawyerEarnings = amount - platformFee - processingFee;
      
      const statuses = ['pendiente', 'procesando', 'completado', 'fallido'];
      const paymentMethods = ['card', 'bank_transfer', 'oxxo'];
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const result = await query(`
        INSERT INTO payments (
          consultation_id, client_id, lawyer_id, amount, platform_fee, 
          lawyer_earnings, currency, payment_method, status,
          ${status === 'completado' ? 'paid_at,' : ''}
          payment_intent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${status === 'completado' ? 'CURRENT_TIMESTAMP,' : ''} $10)
        RETURNING *
      `, [
        consultation.id,
        consultation.client_id,
        consultation.lawyer_id,
        amount,
        platformFee,
        lawyerEarnings,
        'MXN',
        paymentMethod,
        status,
        `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      ]);

      createdPayments.push(result.rows[0]);
    }

    return NextResponse.json({
      success: true,
      data: createdPayments,
      message: `${createdPayments.length} pagos de prueba creados exitosamente`
    });
  } catch (error: any) {
    console.error('Error creating test payments:', error);
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