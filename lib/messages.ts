import 'server-only';
import { query, withTransaction, PoolClient } from './database';

export interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system';
  file_path?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

export interface CreateMessageData {
  consultation_id: string;
  recipient_id: string;
  content: string;
  message_type?: 'text' | 'file' | 'system';
  file_path?: string;
}

// Crear mensaje
export async function createMessage(data: CreateMessageData, senderId: string): Promise<Message> {
  return withTransaction(async (client: PoolClient) => {
    const result = await client.query(`
      INSERT INTO messages (
        consultation_id, sender_id, recipient_id, content, message_type, file_path
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.consultation_id,
      senderId,
      data.recipient_id,
      data.content,
      data.message_type || 'text',
      data.file_path || null
    ]);

    return result.rows[0];
  });
}

// Obtener mensajes de una consulta
export async function getConsultationMessages(consultationId: string, userId: string): Promise<Message[]> {
  try {
    const result = await query(`
      SELECT 
        m.*,
        u.first_name || ' ' || u.last_name as sender_name,
        u.role as sender_role
      FROM messages m
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.consultation_id = $1 
        AND (m.sender_id = $2 OR m.recipient_id = $2)
      ORDER BY m.created_at ASC
    `, [consultationId, userId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching consultation messages:', error);
    throw error;
  }
}

// Marcar mensajes como leídos
export async function markMessagesAsRead(consultationId: string, userId: string): Promise<boolean> {
  return withTransaction(async (client: PoolClient) => {
    await client.query(`
      UPDATE messages 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE consultation_id = $1 
        AND recipient_id = $2 
        AND is_read = false
    `, [consultationId, userId]);

    return true;
  });
}

// Obtener count de mensajes no leídos
export async function getUnreadMessagesCount(userId: string): Promise<number> {
  try {
    const result = await query(`
      SELECT COUNT(*) as count
      FROM messages
      WHERE recipient_id = $1 AND is_read = false
    `, [userId]);
    
    return parseInt(result.rows[0].count) || 0;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
}

// Obtener últimos mensajes por consulta para un usuario
export async function getRecentMessagesByUser(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const result = await query(`
      SELECT DISTINCT ON (m.consultation_id)
        m.*,
        c.title as consultation_title,
        u.first_name || ' ' || u.last_name as other_party_name
      FROM messages m
      LEFT JOIN consultations c ON m.consultation_id = c.id
      LEFT JOIN users u ON (
        CASE 
          WHEN m.sender_id = $1 THEN m.recipient_id 
          ELSE m.sender_id 
        END
      ) = u.id
      WHERE (m.sender_id = $1 OR m.recipient_id = $1)
      ORDER BY m.consultation_id, m.created_at DESC
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting recent messages:', error);
    throw error;
  }
}