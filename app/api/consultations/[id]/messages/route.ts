import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getConsultationMessages, createMessage, markMessagesAsRead } from '@/lib/messages';
import { getConsultationById } from '@/lib/consultations';

function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new Error('Token de autorización requerido');
  }
  return user;
}

// Obtener mensajes de una consulta
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // Verificar que el usuario tenga acceso a la consulta
    const consultation = await getConsultationById(params.id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (user.role !== 'administrador' && 
        consultation.client_id !== user.userId && 
        consultation.lawyer_user_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver estos mensajes' },
        { status: 403 }
      );
    }

    const messages = await getConsultationMessages(params.id, user.userId);
    
    // Marcar mensajes como leídos
    await markMessagesAsRead(params.id, user.userId);

    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
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

// Crear nuevo mensaje
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyAuth(request);
    
    // Verificar que el usuario tenga acceso a la consulta
    const consultation = await getConsultationById(params.id);
    if (!consultation) {
      return NextResponse.json(
        { success: false, error: 'Consulta no encontrada' },
        { status: 404 }
      );
    }

    // Verificar permisos
    if (user.role !== 'administrador' && 
        consultation.client_id !== user.userId && 
        consultation.lawyer_user_id !== user.userId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para enviar mensajes' },
        { status: 403 }
      );
    }

    const { content, message_type } = await request.json();
    
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'El contenido del mensaje es requerido' },
        { status: 400 }
      );
    }

    // Determinar destinatario
    const recipientId = consultation.client_id === user.userId 
      ? consultation.lawyer_user_id 
      : consultation.client_id;

    const messageData = {
      consultation_id: params.id,
      recipient_id: recipientId,
      content: content.trim(),
      message_type: message_type || 'text'
    };

    const newMessage = await createMessage(messageData, user.userId);

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: 'Mensaje enviado exitosamente'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al enviar mensaje',
        message: error.message 
      },
      { status: 500 }
    );
  }
}