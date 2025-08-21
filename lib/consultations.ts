import 'server-only';
import { query, withTransaction, PoolClient } from './database';
import { 
  Consultation, 
  CreateConsultationData,
  UpdateConsultationData,
  ConsultationFilters,
  CONSULTATION_STATUS_FLOW
} from './consultation-types';

// Create consultation
export async function createConsultation(data: CreateConsultationData, clientId: string): Promise<Consultation> {
  return withTransaction(async (client: PoolClient) => {
    const result = await client.query(`
      INSERT INTO consultations (
        client_id, lawyer_id, service_id, title, description, 
        priority, deadline, client_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      clientId,
      data.lawyer_id,
      data.service_id || null,
      data.title,
      data.description,
      data.priority || 'medium',
      data.deadline || null,
      data.client_notes || null
    ]);

    return result.rows[0];
  });
}

// Update consultation
export async function updateConsultation(data: UpdateConsultationData, userId: string, userRole?: string): Promise<Consultation | null> {
  return withTransaction(async (client: PoolClient) => {
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title) {
      updateFields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description) {
      updateFields.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.priority) {
      updateFields.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }
    if (data.status) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.estimated_price !== undefined) {
      updateFields.push(`estimated_price = $${paramIndex++}`);
      values.push(data.estimated_price);
    }
    if (data.final_price !== undefined) {
      updateFields.push(`final_price = $${paramIndex++}`);
      values.push(data.final_price);
    }
    if (data.deadline !== undefined) {
      updateFields.push(`deadline = $${paramIndex++}`);
      values.push(data.deadline);
    }
    if (data.client_notes !== undefined) {
      updateFields.push(`client_notes = $${paramIndex++}`);
      values.push(data.client_notes);
    }
    if (data.lawyer_notes !== undefined) {
      updateFields.push(`lawyer_notes = $${paramIndex++}`);
      values.push(data.lawyer_notes);
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(data.id);
    
    let queryText = `
      UPDATE consultations 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex++}`;
    
    // Only check ownership if not admin
    if (userRole !== 'administrador') {
      queryText += ` AND (client_id = $${paramIndex++} OR lawyer_id = $${paramIndex++})`;
      values.push(userId, userId);
    }
    
    queryText += ` RETURNING *`;
    
    const result = await client.query(queryText, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  });
}

// Get consultation by ID
export async function getConsultationById(consultationId: string): Promise<Consultation | null> {
  try {
    const result = await query(`
      SELECT 
        c.*,
        uc.first_name || ' ' || uc.last_name as client_name,
        uc.email as client_email,
        ul.first_name || ' ' || ul.last_name as lawyer_name,
        ul.email as lawyer_email,
        ls.title as service_title,
        ls.service_type
      FROM consultations c
      LEFT JOIN users uc ON c.client_id = uc.id
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      LEFT JOIN users ul ON lp.user_id = ul.id
      LEFT JOIN lawyer_services ls ON c.service_id = ls.id
      WHERE c.id = $1
    `, [consultationId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching consultation by ID:', error);
    throw error;
  }
}

// Get consultations for a client
export async function getClientConsultations(clientId: string, filters?: ConsultationFilters): Promise<Consultation[]> {
  try {
    let queryText = `
      SELECT 
        c.*,
        uc.first_name || ' ' || uc.last_name as client_name,
        uc.email as client_email,
        ul.first_name || ' ' || ul.last_name as lawyer_name,
        ul.email as lawyer_email,
        ls.title as service_title,
        ls.service_type
      FROM consultations c
      LEFT JOIN users uc ON c.client_id = uc.id
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      LEFT JOIN users ul ON lp.user_id = ul.id
      LEFT JOIN lawyer_services ls ON c.service_id = ls.id
      WHERE c.client_id = $1
    `;

    const conditions: string[] = [];
    const params: any[] = [clientId];
    let paramIndex = 2;

    if (filters?.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters?.priority) {
      conditions.push(`c.priority = $${paramIndex++}`);
      params.push(filters.priority);
    }

    if (filters?.date_from) {
      conditions.push(`c.created_at >= $${paramIndex++}`);
      params.push(filters.date_from);
    }

    if (filters?.date_to) {
      conditions.push(`c.created_at <= $${paramIndex++}`);
      params.push(filters.date_to);
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching client consultations:', error);
    throw error;
  }
}

// Get consultations for a lawyer
export async function getLawyerConsultations(lawyerId: string, filters?: ConsultationFilters): Promise<Consultation[]> {
  try {
    let queryText = `
      SELECT 
        c.*,
        uc.first_name || ' ' || uc.last_name as client_name,
        uc.email as client_email,
        ul.first_name || ' ' || ul.last_name as lawyer_name,
        ul.email as lawyer_email,
        ls.title as service_title,
        ls.service_type
      FROM consultations c
      LEFT JOIN users uc ON c.client_id = uc.id
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      LEFT JOIN users ul ON lp.user_id = ul.id
      LEFT JOIN lawyer_services ls ON c.service_id = ls.id
      WHERE c.lawyer_id = $1
    `;

    const conditions: string[] = [];
    const params: any[] = [lawyerId];
    let paramIndex = 2;

    if (filters?.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters?.priority) {
      conditions.push(`c.priority = $${paramIndex++}`);
      params.push(filters.priority);
    }

    if (filters?.date_from) {
      conditions.push(`c.created_at >= $${paramIndex++}`);
      params.push(filters.date_from);
    }

    if (filters?.date_to) {
      conditions.push(`c.created_at <= $${paramIndex++}`);
      params.push(filters.date_to);
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching lawyer consultations:', error);
    throw error;
  }
}

// Get all consultations (admin only)
export async function getAllConsultations(filters?: ConsultationFilters): Promise<Consultation[]> {
  try {
    let queryText = `
      SELECT 
        c.*,
        uc.first_name || ' ' || uc.last_name as client_name,
        uc.email as client_email,
        ul.first_name || ' ' || ul.last_name as lawyer_name,
        ul.email as lawyer_email,
        ls.title as service_title,
        ls.service_type
      FROM consultations c
      LEFT JOIN users uc ON c.client_id = uc.id
      LEFT JOIN lawyer_profiles lp ON c.lawyer_id = lp.id
      LEFT JOIN users ul ON lp.user_id = ul.id
      LEFT JOIN lawyer_services ls ON c.service_id = ls.id
      WHERE 1=1
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      conditions.push(`c.status = $${paramIndex++}`);
      params.push(filters.status);
    }

    if (filters?.priority) {
      conditions.push(`c.priority = $${paramIndex++}`);
      params.push(filters.priority);
    }

    if (filters?.lawyer_id) {
      conditions.push(`c.lawyer_id = $${paramIndex++}`);
      params.push(filters.lawyer_id);
    }

    if (filters?.client_id) {
      conditions.push(`c.client_id = $${paramIndex++}`);
      params.push(filters.client_id);
    }

    if (filters?.date_from) {
      conditions.push(`c.created_at >= $${paramIndex++}`);
      params.push(filters.date_from);
    }

    if (filters?.date_to) {
      conditions.push(`c.created_at <= $${paramIndex++}`);
      params.push(filters.date_to);
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY c.created_at DESC`;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching all consultations:', error);
    throw error;
  }
}

// Accept consultation (lawyer action)
export async function acceptConsultation(consultationId: string, lawyerId: string, estimatedPrice?: number): Promise<Consultation | null> {
  return withTransaction(async (client: PoolClient) => {
    const updateFields = ['status = $2'];
    const values = [consultationId, 'aceptada'];
    let paramIndex = 3;

    if (estimatedPrice !== undefined) {
      updateFields.push(`estimated_price = $${paramIndex++}`);
      values.push(estimatedPrice);
    }

    const result = await client.query(`
      UPDATE consultations 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND lawyer_id = $${paramIndex++} AND status = 'pendiente'
      RETURNING *
    `, [...values, lawyerId]);

    if (result.rows.length === 0) {
      return null;
    }

    // Update lawyer's total consultations
    await client.query(`
      UPDATE lawyer_profiles 
      SET total_consultations = total_consultations + 1
      WHERE id = $1
    `, [lawyerId]);

    return result.rows[0];
  });
}

// Complete consultation
export async function completeConsultation(consultationId: string, userId: string, finalPrice?: number): Promise<Consultation | null> {
  return withTransaction(async (client: PoolClient) => {
    const updateFields = ['status = $2'];
    const values = [consultationId, 'completada'];
    let paramIndex = 3;

    if (finalPrice !== undefined) {
      updateFields.push(`final_price = $${paramIndex++}`);
      values.push(finalPrice);
    }

    const result = await client.query(`
      UPDATE consultations 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND (client_id = $${paramIndex++} OR lawyer_id = $${paramIndex++}) 
        AND status IN ('aceptada', 'en_proceso')
      RETURNING *
    `, [...values, userId, userId]);

    return result.rows.length > 0 ? result.rows[0] : null;
  });
}

// Cancel consultation
export async function cancelConsultation(consultationId: string, userId: string, userRole?: string): Promise<Consultation | null> {
  return withTransaction(async (client: PoolClient) => {
    let queryText = `
      UPDATE consultations 
      SET status = 'cancelada', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('pendiente', 'aceptada', 'en_proceso')
    `;

    const params = [consultationId];

    // Only check ownership if not admin
    if (userRole !== 'administrador') {
      queryText += ` AND (client_id = $2 OR lawyer_id = $3)`;
      params.push(userId, userId);
    }

    queryText += ` RETURNING *`;

    const result = await client.query(queryText, params);

    return result.rows.length > 0 ? result.rows[0] : null;
  });
}

// Check if status transition is valid
export function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = CONSULTATION_STATUS_FLOW[currentStatus as keyof typeof CONSULTATION_STATUS_FLOW];
  return allowedTransitions.includes(newStatus as any);
}

// Get consultation statistics
export async function getConsultationStats(userId?: string, userRole?: string): Promise<any> {
  try {
    let queryText = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(final_price) as avg_price,
        SUM(final_price) as total_revenue
      FROM consultations
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (userId && userRole !== 'administrador') {
      queryText += ` WHERE (client_id = $${paramIndex++} OR lawyer_id = $${paramIndex++})`;
      params.push(userId, userId);
    }

    queryText += ` GROUP BY status ORDER BY count DESC`;

    const result = await query(queryText, params);
    return result.rows;
  } catch (error) {
    console.error('Error fetching consultation stats:', error);
    throw error;
  }
}