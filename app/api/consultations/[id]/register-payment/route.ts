import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getConsultationById } from '@/lib/consultations';
import { query, withTransaction, PoolClient } from '@/lib/database';

function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // Only admins can register payments manually
    if (user.role !== 'administrador') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los administradores pueden registrar pagos manualmente' 
        },
        { status: 403 }
      );
    }

    const { amount, payment_method, status, notes } = await request.json();

    if (!amount || !payment_method) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Monto y método de pago son requeridos' 
        },
        { status: 400 }
      );
    }

    // Get consultation details
    const consultation = await getConsultationById(params.id);
    if (!consultation) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Consulta no encontrada' 
        },
        { status: 404 }
      );
    }

    // Check if payment already exists for this consultation
    const existingPayment = await query(
      'SELECT id FROM payments WHERE consultation_id = $1',
      [params.id]
    );

    if (existingPayment.rows.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Ya existe un pago registrado para esta consulta' 
        },
        { status: 400 }
      );
    }

    const payment = await withTransaction(async (client: PoolClient) => {
      // Calculate fees
      const platformFee = Math.round(amount * 0.10 * 100) / 100; // 10%
      const processingFee = Math.round(amount * 0.029 * 100) / 100; // 2.9%
      const lawyerEarnings = amount - platformFee - processingFee;

      // Create payment record
      const result = await client.query(`
        INSERT INTO payments (
          consultation_id, client_id, lawyer_id, amount, platform_fee, 
          lawyer_earnings, currency, payment_method, status,
          ${status === 'completado' ? 'paid_at,' : ''}
          payment_intent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${status === 'completado' ? 'CURRENT_TIMESTAMP,' : ''} $10)
        RETURNING *
      `, [
        params.id,
        consultation.client_id,
        consultation.lawyer_id,
        amount,
        platformFee,
        lawyerEarnings,
        'MXN',
        payment_method,
        status || 'pendiente',
        `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      ]);

      // Log activity
      try {
        const actionDescription = `Pago registrado manualmente - ${formatCurrency(amount)} via ${payment_method}`;
        const logValues = {
          amount,
          payment_method,
          status: status || 'pendiente',
          notes: notes || 'Registro manual por administrador'
        };

        await client.query(`
          INSERT INTO activity_logs (user_id, action, resource_type, resource_id, new_values)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          user.userId,
          actionDescription,
          'payment',
          result.rows[0].id,
          JSON.stringify(logValues)
        ]);
      } catch (logError) {
        console.error('Error logging payment registration:', logError);
        // Don't fail the entire transaction if logging fails
      }

      return result.rows[0];
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Pago registrado exitosamente'
    });
  } catch (error: any) {
    console.error('Error registering payment:', error);
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

function formatCurrency(amount: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}