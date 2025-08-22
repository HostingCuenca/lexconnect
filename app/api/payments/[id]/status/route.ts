import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { query, withTransaction, PoolClient } from '@/lib/database';

function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // Only admins can update payment status manually
    if (user.role !== 'administrador') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Solo los administradores pueden actualizar estados de pago manualmente' 
        },
        { status: 403 }
      );
    }

    const { status, notes } = await request.json();

    if (!status) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Estado requerido' 
        },
        { status: 400 }
      );
    }

    // Valid payment statuses
    const validStatuses = ['pendiente', 'procesando', 'completado', 'fallido', 'reembolsado'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Estado no válido' 
        },
        { status: 400 }
      );
    }

    const updatedPayment = await withTransaction(async (client: PoolClient) => {
      // Get current payment for logging
      const currentResult = await client.query('SELECT * FROM payments WHERE id = $1', [params.id]);
      
      if (currentResult.rows.length === 0) {
        throw new Error('Pago no encontrado');
      }

      const currentPayment = currentResult.rows[0];

      // Update payment status
      const updateFields = ['status = $2'];
      const values = [params.id, status];
      let paramIndex = 3;

      if (status === 'completado' && !currentPayment.paid_at) {
        updateFields.push(`paid_at = CURRENT_TIMESTAMP`);
      }

      const updateQuery = `
        UPDATE payments 
        SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Error actualizando el pago');
      }

      // Log activity
      try {
        const actionDescription = `Estado de pago actualizado de '${currentPayment.status}' a '${status}'`;
        const oldValues = { status: currentPayment.status };
        const newValues = { status: status };

        if (notes) {
          newValues.notes = notes;
        }

        await client.query(`
          INSERT INTO activity_logs (user_id, action, resource_type, resource_id, old_values, new_values)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          user.userId,
          actionDescription,
          'payment',
          params.id,
          JSON.stringify(oldValues),
          JSON.stringify(newValues)
        ]);
      } catch (logError) {
        console.error('Error logging payment status change:', logError);
        // Don't fail the entire transaction if logging fails
      }

      return result.rows[0];
    });

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: 'Estado de pago actualizado exitosamente'
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
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