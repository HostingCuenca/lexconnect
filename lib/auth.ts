import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Configuración
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Tipos para autenticación
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'cliente' | 'abogado' | 'administrador';
  firstName: string;
  lastName: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: JWTPayload;
  token?: string;
}

// Funciones para hash de passwords
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Funciones para JWT
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'lexconnect',
    audience: 'lexconnect-users'
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'lexconnect',
      audience: 'lexconnect-users'
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Error verificando token JWT:', error);
    return null;
  }
}

// Extraer token del header Authorization
export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

// Middleware helper para verificar autenticación
export function getAuthenticatedUser(request: NextRequest): JWTPayload | null {
  const token = extractTokenFromRequest(request);
  if (!token) return null;
  
  return verifyToken(token);
}

// Validación de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validación de password
export function validatePassword(password: string): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra minúscula');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('La contraseña debe contener al menos una letra mayúscula');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('La contraseña debe contener al menos un número');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validación de roles
export function isValidRole(role: string): role is 'cliente' | 'abogado' | 'administrador' {
  return ['cliente', 'abogado', 'administrador'].includes(role);
}

// Helper para respuestas de error estandarizadas
export function createAuthError(message: string, status: number = 401): Response {
  return new Response(JSON.stringify({
    success: false,
    message,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Helper para respuestas de éxito estandarizadas
export function createAuthSuccess(data: any, message: string = 'Operación exitosa'): Response {
  return new Response(JSON.stringify({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Función para sanitizar datos de usuario (remover información sensible)
export function sanitizeUser(user: any): Omit<any, 'password_hash'> {
  const { password_hash, ...sanitized } = user;
  return sanitized;
}

// Rate limiting simple (en memoria - para producción usar Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
  const now = new Date();
  const record = loginAttempts.get(identifier);
  
  if (!record) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Limpiar si la ventana de tiempo ha pasado
  if (now.getTime() - record.lastAttempt.getTime() > windowMs) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Incrementar contador
  record.count++;
  record.lastAttempt = now;
  
  return record.count <= maxAttempts;
}

export function resetRateLimit(identifier: string): void {
  loginAttempts.delete(identifier);
}

// Función para generar códigos de verificación
export function generateVerificationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Función para validar nombre completo
export function validateName(name: string): boolean {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿñÑ\s]+$/.test(name);
}

// Función para validar teléfono ecuatoriano
export function validateEcuadorianPhone(phone: string): boolean {
  // Formato: +593 xxx xxx xxxx o xxx xxx xxxx (Ecuador)
  const phoneRegex = /^(\+593\s?)?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}