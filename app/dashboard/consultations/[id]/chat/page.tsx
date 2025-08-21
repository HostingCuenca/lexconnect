'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock,
  FileText,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  consultation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: string;
  client_name?: string;
  client_email?: string;
  lawyer_name?: string;
  lawyer_email?: string;
  service_title?: string;
}

export default function ConsultationChatPage() {
  const params = useParams();
  const { user, token } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const consultationId = params.id as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (consultationId && token) {
      fetchConsultationAndMessages();
    }
  }, [consultationId, token]);

  const fetchConsultationAndMessages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch consultation details
      const consultationResponse = await fetch(`/api/consultations/${consultationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!consultationResponse.ok) {
        throw new Error('Error al cargar la consulta');
      }

      const consultationResult = await consultationResponse.json();
      if (consultationResult.success) {
        setConsultation(consultationResult.data);
      }

      // Fetch messages
      const messagesResponse = await fetch(`/api/consultations/${consultationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!messagesResponse.ok) {
        throw new Error('Error al cargar los mensajes');
      }

      const messagesResult = await messagesResponse.json();
      if (messagesResult.success) {
        setMessages(messagesResult.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      
      const response = await fetch(`/api/consultations/${consultationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          message_type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar el mensaje');
      }

      const result = await response.json();
      if (result.success) {
        setNewMessage('');
        fetchConsultationAndMessages(); // Refresh messages
      } else {
        throw new Error(result.message || 'Error al enviar el mensaje');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
      aceptada: { label: 'Aceptada', color: 'bg-blue-100 text-blue-800' },
      en_proceso: { label: 'En Proceso', color: 'bg-purple-100 text-purple-800' },
      completada: { label: 'Completada', color: 'bg-green-100 text-green-800' },
      cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
    };
    return configs[status as keyof typeof configs] || configs.pendiente;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !consultation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Consulta no encontrada'}</p>
          <Link href="/dashboard/consultations">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Consultas
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(consultation.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/consultations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{consultation.title}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className={statusConfig.color}>
                  <Shield className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                {consultation.service_title && (
                  <span className="text-sm text-gray-600">
                    <FileText className="h-3 w-3 inline mr-1" />
                    {consultation.service_title}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Consultation Info Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {user?.role === 'abogado' || user?.role === 'administrador' ? 'Cliente' : 'Abogado'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">
                        {user?.role === 'abogado' || user?.role === 'administrador' 
                          ? consultation.client_name 
                          : consultation.lawyer_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {user?.role === 'abogado' || user?.role === 'administrador' 
                          ? consultation.client_email 
                          : consultation.lawyer_email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Descripción</p>
                  <p className="text-sm text-gray-700">{consultation.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Messages */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Conversación</CardTitle>
                <CardDescription>
                  Comunícate directamente antes de oficializar la consulta
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay mensajes aún</p>
                      <p className="text-sm text-gray-400">Inicia la conversación</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.userId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_id === user?.userId
                              ? 'bg-primary text-white'
                              : 'bg-white border shadow-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            message.sender_id === user?.userId ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {message.sender_name}
                            </span>
                            <span className="text-xs flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || sending}
                    size="sm"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}