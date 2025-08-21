import 'server-only';
import { query, withTransaction, PoolClient } from './database';
import { 
  LawyerProfile, 
  LegalSpecialty, 
  LawyerService,
  CreateLawyerProfileData,
  UpdateLawyerProfileData,
  CreateLawyerServiceData,
  UpdateLawyerServiceData
} from './lawyer-types';

// Create lawyer profile
export async function createLawyerProfile(data: CreateLawyerProfileData, userId: string): Promise<LawyerProfile> {
  return withTransaction(async (client: PoolClient) => {
    // Insert lawyer profile
    const result = await client.query(`
      INSERT INTO lawyer_profiles (
        user_id, license_number, bar_association, years_experience, 
        education, bio, hourly_rate, consultation_rate, office_address, 
        languages, availability_schedule
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      userId,
      data.license_number,
      data.bar_association,
      data.years_experience,
      data.education,
      data.bio,
      data.hourly_rate,
      data.consultation_rate,
      data.office_address,
      data.languages,
      JSON.stringify(data.availability_schedule || {})
    ]);

    const newProfile = result.rows[0];

    // Add specialties if provided
    if (data.specialties && data.specialties.length > 0) {
      for (const specialtyId of data.specialties) {
        await client.query(`
          INSERT INTO lawyer_specialties (lawyer_id, specialty_id) 
          VALUES ($1, $2)
        `, [newProfile.id, specialtyId]);
      }
    }

    return newProfile;
  });
}

// Update lawyer profile
export async function updateLawyerProfile(data: UpdateLawyerProfileData, userId: string, userRole?: string): Promise<LawyerProfile | null> {
  return withTransaction(async (client: PoolClient) => {
    // Build dynamic update query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.license_number) {
      updateFields.push(`license_number = $${paramIndex++}`);
      values.push(data.license_number);
    }
    if (data.bar_association) {
      updateFields.push(`bar_association = $${paramIndex++}`);
      values.push(data.bar_association);
    }
    if (data.years_experience !== undefined) {
      updateFields.push(`years_experience = $${paramIndex++}`);
      values.push(data.years_experience);
    }
    if (data.education) {
      updateFields.push(`education = $${paramIndex++}`);
      values.push(data.education);
    }
    if (data.bio) {
      updateFields.push(`bio = $${paramIndex++}`);
      values.push(data.bio);
    }
    if (data.hourly_rate !== undefined) {
      updateFields.push(`hourly_rate = $${paramIndex++}`);
      values.push(data.hourly_rate);
    }
    if (data.consultation_rate !== undefined) {
      updateFields.push(`consultation_rate = $${paramIndex++}`);
      values.push(data.consultation_rate);
    }
    if (data.office_address) {
      updateFields.push(`office_address = $${paramIndex++}`);
      values.push(data.office_address);
    }
    if (data.languages) {
      updateFields.push(`languages = $${paramIndex++}`);
      values.push(data.languages);
    }
    if (data.availability_schedule) {
      updateFields.push(`availability_schedule = $${paramIndex++}`);
      values.push(JSON.stringify(data.availability_schedule));
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(data.id);
    
    let queryText = `
      UPDATE lawyer_profiles 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex++}`;
    
    // Solo verificar propietario si no es administrador
    if (userRole !== 'administrador') {
      queryText += ` AND user_id = $${paramIndex++}`;
      values.push(userId);
    }
    
    queryText += ` RETURNING *`;
    
    const result = await client.query(queryText, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  });
}

// Get lawyer profile by user ID
export async function getLawyerProfileByUserId(userId: string): Promise<LawyerProfile | null> {
  try {
    const result = await query(`
      SELECT 
        lp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
      WHERE lp.user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) return null;
    
    const lawyer = result.rows[0];
    
    // Get specialties
    lawyer.specialties = await getLawyerSpecialties(lawyer.id);
    
    // Get services
    lawyer.services = await getLawyerServices(lawyer.id);
    
    return lawyer;
  } catch (error) {
    console.error('Error fetching lawyer profile:', error);
    throw error;
  }
}

// Get lawyer profile by ID
export async function getLawyerProfileById(lawyerId: string): Promise<LawyerProfile | null> {
  try {
    const result = await query(`
      SELECT 
        lp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
      WHERE lp.id = $1
    `, [lawyerId]);
    
    if (result.rows.length === 0) return null;
    
    const lawyer = result.rows[0];
    
    // Get specialties
    lawyer.specialties = await getLawyerSpecialties(lawyer.id);
    
    // Get services
    lawyer.services = await getLawyerServices(lawyer.id);
    
    return lawyer;
  } catch (error) {
    console.error('Error fetching lawyer profile by ID:', error);
    throw error;
  }
}

// Get all lawyer profiles
export async function getAllLawyerProfiles(): Promise<LawyerProfile[]> {
  try {
    const result = await query(`
      SELECT 
        lp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
      ORDER BY lp.rating DESC, lp.total_reviews DESC
    `);
    
    const lawyers = result.rows;
    
    // Get specialties and services for each lawyer
    for (const lawyer of lawyers) {
      lawyer.specialties = await getLawyerSpecialties(lawyer.id);
      lawyer.services = await getLawyerServices(lawyer.id);
    }
    
    return lawyers;
  } catch (error) {
    console.error('Error fetching all lawyer profiles:', error);
    throw error;
  }
}

// Get lawyers by specialty
export async function getLawyersBySpecialty(specialtyId: string): Promise<LawyerProfile[]> {
  try {
    const result = await query(`
      SELECT 
        lp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
      INNER JOIN lawyer_specialties ls ON lp.id = ls.lawyer_id
      WHERE ls.specialty_id = $1
      ORDER BY lp.rating DESC, lp.total_reviews DESC
    `, [specialtyId]);
    
    const lawyers = result.rows;
    
    for (const lawyer of lawyers) {
      lawyer.specialties = await getLawyerSpecialties(lawyer.id);
      lawyer.services = await getLawyerServices(lawyer.id);
    }
    
    return lawyers;
  } catch (error) {
    console.error('Error fetching lawyers by specialty:', error);
    throw error;
  }
}

// Get lawyer specialties
export async function getLawyerSpecialties(lawyerId: string): Promise<LegalSpecialty[]> {
  try {
    const result = await query(`
      SELECT ls.*
      FROM legal_specialties ls
      INNER JOIN lawyer_specialties lsp ON ls.id = lsp.specialty_id
      WHERE lsp.lawyer_id = $1 AND ls.is_active = true
      ORDER BY ls.name
    `, [lawyerId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching lawyer specialties:', error);
    throw error;
  }
}

// Update lawyer specialties
export async function updateLawyerSpecialties(lawyerId: string, specialtyIds: string[]): Promise<void> {
  return withTransaction(async (client: PoolClient) => {
    // Remove existing specialties
    await client.query('DELETE FROM lawyer_specialties WHERE lawyer_id = $1', [lawyerId]);
    
    // Add new specialties
    for (const specialtyId of specialtyIds) {
      await client.query(`
        INSERT INTO lawyer_specialties (lawyer_id, specialty_id) 
        VALUES ($1, $2)
      `, [lawyerId, specialtyId]);
    }
  });
}

// Get all legal specialties
export async function getAllLegalSpecialties(): Promise<LegalSpecialty[]> {
  try {
    const result = await query(`
      SELECT * FROM legal_specialties 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching legal specialties:', error);
    throw error;
  }
}

// LAWYER SERVICES

// Create lawyer service
export async function createLawyerService(data: CreateLawyerServiceData, lawyerId: string): Promise<LawyerService> {
  try {
    const result = await query(`
      INSERT INTO lawyer_services (
        lawyer_id, title, description, price, duration_minutes, 
        service_type, requirements, deliverables
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      lawyerId,
      data.title,
      data.description,
      data.price,
      data.duration_minutes,
      data.service_type,
      data.requirements || '',
      data.deliverables || ''
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Error creating lawyer service:', error);
    throw error;
  }
}

// Update lawyer service
export async function updateLawyerService(data: UpdateLawyerServiceData, lawyerId: string): Promise<LawyerService | null> {
  try {
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
    if (data.price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }
    if (data.duration_minutes !== undefined) {
      updateFields.push(`duration_minutes = $${paramIndex++}`);
      values.push(data.duration_minutes);
    }
    if (data.service_type) {
      updateFields.push(`service_type = $${paramIndex++}`);
      values.push(data.service_type);
    }
    if (data.status) {
      updateFields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.requirements !== undefined) {
      updateFields.push(`requirements = $${paramIndex++}`);
      values.push(data.requirements);
    }
    if (data.deliverables !== undefined) {
      updateFields.push(`deliverables = $${paramIndex++}`);
      values.push(data.deliverables);
    }

    if (updateFields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    values.push(data.id, lawyerId);
    
    const result = await query(`
      UPDATE lawyer_services 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex++} AND lawyer_id = $${paramIndex++}
      RETURNING *
    `, values);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error updating lawyer service:', error);
    throw error;
  }
}

// Get lawyer services
export async function getLawyerServices(lawyerId: string): Promise<LawyerService[]> {
  try {
    const result = await query(`
      SELECT * FROM lawyer_services 
      WHERE lawyer_id = $1 
      ORDER BY created_at DESC
    `, [lawyerId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching lawyer services:', error);
    throw error;
  }
}

// Get service by ID
export async function getLawyerServiceById(serviceId: string): Promise<LawyerService | null> {
  try {
    const result = await query(`
      SELECT * FROM lawyer_services WHERE id = $1
    `, [serviceId]);
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching lawyer service by ID:', error);
    throw error;
  }
}

// Delete lawyer service
export async function deleteLawyerService(serviceId: string, lawyerId: string): Promise<boolean> {
  try {
    const result = await query(`
      DELETE FROM lawyer_services 
      WHERE id = $1 AND lawyer_id = $2
      RETURNING id
    `, [serviceId, lawyerId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting lawyer service:', error);
    throw error;
  }
}

// Search lawyers
export async function searchLawyers(searchTerm?: string, specialtyId?: string): Promise<LawyerProfile[]> {
  try {
    let queryText = `
      SELECT DISTINCT
        lp.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url
      FROM lawyer_profiles lp
      LEFT JOIN users u ON lp.user_id = u.id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (specialtyId) {
      queryText += ` INNER JOIN lawyer_specialties ls ON lp.id = ls.lawyer_id`;
      conditions.push(`ls.specialty_id = $${paramIndex++}`);
      params.push(specialtyId);
    }

    if (searchTerm) {
      conditions.push(`(
        u.first_name ILIKE $${paramIndex++} OR 
        u.last_name ILIKE $${paramIndex++} OR 
        lp.bio ILIKE $${paramIndex++} OR
        lp.education ILIKE $${paramIndex++}
      )`);
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` ORDER BY lp.rating DESC, lp.total_reviews DESC`;

    const result = await query(queryText, params);
    const lawyers = result.rows;
    
    for (const lawyer of lawyers) {
      lawyer.specialties = await getLawyerSpecialties(lawyer.id);
      lawyer.services = await getLawyerServices(lawyer.id);
    }
    
    return lawyers;
  } catch (error) {
    console.error('Error searching lawyers:', error);
    throw error;
  }
}