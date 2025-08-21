# 🚀 LexConnect Development Guide

Esta guía proporciona patrones, mejores prácticas y flujos de trabajo claros para el desarrollo de LexConnect. **LEE ESTA GUÍA ANTES DE HACER CUALQUIER CAMBIO.**

## 📋 Información del Proyecto

### Stack Tecnológico
- **Frontend**: Next.js 13.5.1 con App Router + TypeScript
- **Backend**: API Routes de Next.js
- **Base de Datos**: PostgreSQL con conexión directa
- **Autenticación**: JWT con localStorage + httpOnly cookies
- **UI**: Tailwind CSS + shadcn/ui
- **Idioma**: Español (aplicación legal ecuatoriana)

### Arquitectura de Roles
```typescript
type UserRole = 'cliente' | 'abogado' | 'administrador';
```

## 🔐 Patrones de Autenticación

### ✅ SIEMPRE Usar Funciones Centralizadas

**❌ NUNCA HAGAS ESTO:**
```typescript
// NO duplicar lógica JWT en cada API route
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback') as any;
```

**✅ SIEMPRE HAZ ESTO:**
```typescript
// Usar funciones centralizadas de lib/auth.ts
import { getAuthenticatedUser } from '@/lib/auth';

function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) throw new Error('Token de autorización requerido');
  return user;
}
```

### 🔑 Niveles de Autorización

1. **Autenticación Simple** (`verifyAuth`): Cualquier usuario logueado
2. **Solo Admin** (`verifyAdminAuth`): Solo administradores
3. **Propietario o Admin**: Autor del recurso O administrador

### 📝 Patrón para Operaciones CRUD

```typescript
// Para operaciones donde el autor O admin pueden actuar
function verifyOwnerOrAdmin(request: NextRequest) {
  return getAuthenticatedUser(request); // Retorna user, validación en función de negocio
}

// En función de negocio (ej: updateBlogPost)
export async function updateResource(data: UpdateData, userId: string, userRole?: string) {
  let whereClause = 'WHERE id = $1';
  const values = [data.id];
  
  // Solo verificar propiedad si NO es admin
  if (userRole !== 'administrador') {
    whereClause += ' AND author_id = $2';
    values.push(userId);
  }
  
  const query = `UPDATE table SET ... ${whereClause} RETURNING *`;
  return await client.query(query, values);
}
```

## 🗄️ Patrones de Base de Datos

### ✅ SIEMPRE Usar Transacciones para Operaciones Complejas

```typescript
import { withTransaction } from './database';

export async function complexOperation(data: Data): Promise<Result> {
  return withTransaction(async (client: PoolClient) => {
    // Todas las operaciones aquí son atómicas
    const result1 = await client.query('...');
    const result2 = await client.query('...');
    return result1.rows[0];
  });
}
```

### 🔍 Manejo de Errores en DB

```typescript
try {
  const result = await query('SELECT ...', [param]);
  if (result.rows.length === 0) return null; // No encontrado
  return result.rows[0];
} catch (error) {
  console.error('Error específico en operación:', error);
  throw error; // Re-lanzar para manejo en nivel superior
}
```

## 🛠️ Flujo de Debugging

### 1. **Problema Identificado**
- ✅ Reproducir el error exacto
- ✅ Identificar en qué capa ocurre (Frontend/API/DB)

### 2. **Agregar Logs Temporales (Solo para debugging)**
```typescript
// ⚠️ LOGS TEMPORALES - REMOVER ANTES DE COMMIT
console.log('🔍 DEBUG - Input data:', data);
console.log('🔍 DEBUG - User role:', userRole);
console.log('🔍 DEBUG - Query:', query);
console.log('🔍 DEBUG - Result:', result);
```

### 3. **Identificar Root Cause**
- ¿Es problema de autenticación? → Revisar JWT_SECRET consistency
- ¿Es problema de autorización? → Revisar lógica de roles  
- ¿Es problema de DB? → Revisar query y parámetros
- ¿Es problema de tipos? → Revisar interfaces

### 4. **Implementar Fix**
- ✅ Usar patrones establecidos
- ✅ Mantener consistencia con codebase existente
- ✅ **REMOVER TODOS LOS LOGS DE DEBUG**

### 5. **Verificar Fix**
- ✅ Probar escenario original
- ✅ Probar casos edge
- ✅ Ejecutar `npm run lint`

## 📁 Estructura y Convenciones

### Directorios Importantes
```
app/
├── api/                    # API Routes
│   ├── auth/              # Autenticación
│   ├── blog/              # Blog operations
│   └── admin/             # Admin operations
├── dashboard/             # Dashboard pages
lib/
├── auth.ts                # 🔑 Funciones de autenticación centralizadas
├── blog.ts                # 📝 Operaciones de blog
├── database.ts            # 🗄️ Conexión y helpers de DB
contexts/
├── AuthContext.tsx        # 🔐 Estado global de autenticación
```

### 🚨 Archivos Críticos - NO TOCAR Sin Entender

1. **`lib/auth.ts`** - Lógica de JWT y autenticación
2. **`lib/database.ts`** - Conexión a PostgreSQL
3. **`contexts/AuthContext.tsx`** - Estado de usuario
4. **`middleware.ts`** - Protección de rutas

## 🔧 Comandos de Desarrollo

### Comandos Esenciales
```bash
npm run dev         # Desarrollo
npm run build      # Build (verificar compilación)
npm run lint       # ⚠️ EJECUTAR ANTES DE COMMIT
npm run start      # Producción
```

### 🔍 Verificación Antes de Commit
```bash
# 1. Linting
npm run lint

# 2. Build test (opcional pero recomendado)
npm run build

# 3. Verificar que no hay logs de debug
grep -r "console.log.*🔍\|console.log.*DEBUG" --include="*.ts" --include="*.tsx" .
```

## ⚠️ Errores Comunes y Soluciones

### 1. **"Token inválido" en operaciones**
**Causa**: Inconsistencia en JWT_SECRET entre generación y validación
**Solución**: 
- Verificar que todos los lugares usen `process.env.JWT_SECRET || 'fallback-secret'`
- NO usar diferentes fallbacks (`'your-secret-key'` vs `'fallback-secret'`)

### 2. **404 en endpoints de blog**
**Causa**: Confusión entre `slug` e `id` en parámetros
**Solución**:
- URLs con UUID → usar `getBlogPostById()`
- URLs con slug → usar `getBlogPostBySlug()`

### 3. **"No autorizado" para admin**
**Causa**: Lógica de autorización muy restrictiva
**Solución**:
- Siempre permitir operaciones de admin con `userRole === 'administrador'`
- Usar patrón de "propietario O admin"

### 4. **Errores de compilación TypeScript**
**Causa**: Imports faltantes o tipos incorrectos
**Solución**:
- Verificar imports en archivos afectados
- Usar interfaces existentes en `lib/blog-types.ts`

## 🎯 Patterns de API Routes

### Estructura Estándar
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

// Helper de autorización
function verifyAuth(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) throw new Error('Token de autorización requerido');
  return user;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const user = verifyAuth(request);
    
    // 2. Obtener y validar datos
    const data = await request.json();
    
    // 3. Ejecutar operación de negocio
    const result = await businessFunction(data, user.userId, user.role);
    
    // 4. Respuesta exitosa
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Operación exitosa'
    });
    
  } catch (error: any) {
    // 5. Manejo de errores
    console.error('Error en operación:', error);
    return NextResponse.json({
      success: false,
      error: 'Error en la operación',
      message: error.message
    }, { status: 500 });
  }
}
```

## 🔄 Workflow de Nuevas Features

### 1. **Planificación**
- ✅ Entender el requerimiento
- ✅ Identificar entidades afectadas
- ✅ Definir nivel de autorización necesario

### 2. **Implementación**
- ✅ Crear/modificar tipos en `lib/*-types.ts`
- ✅ Implementar función de negocio en `lib/*.ts`
- ✅ Crear/modificar API route
- ✅ Usar patrones establecidos

### 3. **Testing**
- ✅ Probar diferentes roles de usuario
- ✅ Probar casos edge y errores
- ✅ Verificar logs limpios

### 4. **Finalización**
- ✅ Linting limpio
- ✅ Sin logs de debug
- ✅ Documentar cambios importantes

## 📞 Debugging de Problemas Específicos

### Blog Operations
```typescript
// Para debugging de blog, usar logs específicos:
console.error('Blog Error:', {
  operation: 'update',
  postId: data.id,
  userId: user.userId,
  userRole: user.role,
  error: error.message
});
```

### Authentication Issues
```typescript
// Para debugging de auth:
console.error('Auth Error:', {
  endpoint: request.url,
  hasToken: !!token,
  tokenValid: !!decoded,
  userRole: decoded?.role,
  error: error.message
});
```

## 🏆 Mejores Prácticas

### ✅ DOs
- Usar funciones centralizadas de `lib/auth.ts`
- Mantener consistencia en JWT_SECRET
- Permitir operaciones de admin siempre
- Usar transacciones para operaciones complejas
- Limpiar logs antes de commit
- Seguir patrones establecidos

### ❌ DON'Ts  
- NO duplicar lógica de autenticación
- NO usar diferentes fallbacks de JWT_SECRET
- NO restringir demasiado operaciones de admin
- NO dejar logs de debug en producción
- NO inventar nuevos patrones sin documentar
- NO tocar archivos críticos sin entender

---

## 🎯 TL;DR para Claude Code

**Antes de cualquier cambio en LexConnect:**

1. **Leer esta guía completa**
2. **Usar patrones establecidos** - NO inventar nuevos
3. **Funciones centralizadas** - `lib/auth.ts` para autenticación
4. **Admin siempre puede** - `userRole === 'administrador'` bypass restrictions
5. **Logs temporales únicamente** - remover antes de commit
6. **Lint antes de finalizar** - `npm run lint`

**En caso de problemas de auth/permisos:**
- Verificar JWT_SECRET consistency
- Usar patrón "propietario O admin"
- Verificar que admin bypasses restrictions

**Archivo de referencia**: Este documento es LA autoridad para desarrollo en LexConnect.