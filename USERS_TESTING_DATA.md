# 👥 Datos de Prueba - Gestión de Usuarios LexConnect

## 🔐 Credenciales de Administrador

Para acceder al panel de gestión de usuarios, usa estas credenciales de administrador:

- **Email:** `admin@lexconnect.mx`
- **Contraseña:** `admin123`
- **Rol:** Administrador

## 📊 URLs de Navegación

### Dashboard de Usuarios
- **Lista de usuarios:** `http://localhost:3000/dashboard/users`
- **Crear usuario:** `http://localhost:3000/dashboard/users/create`
- **Editar usuario:** `http://localhost:3000/dashboard/users/[id]/edit`

### Dashboard Principal
- **Dashboard:** `http://localhost:3000/dashboard`

## 👤 Usuarios Existentes en el Sistema

### 1. **Administrador Principal**
- **ID:** `41dc0e9c-6b15-4c71-bd1e-7892fd2a5c4e`
- **Email:** `admin@lexconnect.mx`
- **Nombre:** Admin User
- **Rol:** Administrador
- **Estado:** Activo ✅
- **Email Verificado:** Sí ✅
- **Registro:** Enero 2024

### 2. **Abogado Civil**
- **ID:** `42dc0e9c-6b15-4c71-bd1e-7892fd2a5c4f`
- **Email:** `maria.gonzalez@lexconnect.mx`
- **Nombre:** María González
- **Rol:** Abogado
- **Estado:** Activo ✅
- **Especialidades:** Derecho Civil, Derecho de Familia
- **Tarifa:** $80/hora

### 3. **Abogado Corporativo**
- **ID:** `43dc0e9c-6b15-4c71-bd1e-7892fd2a5c50`
- **Email:** `carlos.mendez@lexconnect.mx`
- **Nombre:** Carlos Méndez
- **Rol:** Abogado
- **Estado:** Activo ✅
- **Especialidades:** Derecho Corporativo, Derecho Laboral
- **Tarifa:** $120/hora

### 4. **Cliente Corporativo**
- **ID:** `44dc0e9c-6b15-4c71-bd1e-7892fd2a5c51`
- **Email:** `ana.torres@empresa.com`
- **Nombre:** Ana Torres
- **Rol:** Cliente
- **Estado:** Activo ✅
- **Tipo:** Cliente corporativo

### 5. **Cliente Individual**
- **ID:** `45dc0e9c-6b15-4c71-bd1e-7892fd2a5c52`
- **Email:** `luis.rodriguez@gmail.com`
- **Nombre:** Luis Rodríguez
- **Rol:** Cliente
- **Estado:** Activo ✅
- **Tipo:** Cliente individual

## 🧪 Escenarios de Prueba

### ✅ Crear Usuario
1. **Navegación:** Ve a `/dashboard/users/create`
2. **Credenciales requeridas:** Admin login
3. **Campos obligatorios:**
   - Email (único)
   - Contraseña (mín. 8 caracteres, mayúscula, minúscula, número, carácter especial)
   - Nombre y apellido
   - Rol (cliente/abogado/administrador)
4. **Campos opcionales:**
   - Teléfono
   - Email verificado (checkbox)
   - Usuario activo (checkbox)

**Casos de prueba:**
- ✅ Usuario válido con todos los campos
- ❌ Email duplicado
- ❌ Contraseña débil
- ❌ Campos obligatorios vacíos

### ✅ Editar Usuario
1. **Navegación:** Desde `/dashboard/users`, clic en ícono de editar
2. **URL:** `/dashboard/users/[id]/edit`
3. **Funcionalidades:**
   - Formulario pre-poblado
   - Cambio de contraseña opcional
   - Modificación de datos personales
   - Cambio de rol
   - Toggle de verificación de email
   - Toggle de estado activo/inactivo

**Casos de prueba:**
- ✅ Editar datos personales
- ✅ Cambiar rol de usuario
- ✅ Cambiar contraseña
- ✅ Activar/desactivar usuario
- ❌ Email ya en uso por otro usuario

### ✅ Eliminar Usuario
1. **Navegación:** Desde `/dashboard/users`, clic en ícono de papelera
2. **Confirmación:** Modal de confirmación
3. **Restricciones:**
   - No se puede eliminar a sí mismo
   - No se puede eliminar si tiene dependencias (consultas, pagos, posts)
   - Sugiere desactivar en lugar de eliminar

**Casos de prueba:**
- ✅ Eliminar usuario sin dependencias
- ❌ Eliminar usuario con consultas activas
- ❌ Auto-eliminación (administrador)
- ❌ Eliminar usuario con posts de blog

### ✅ Activar/Desactivar Usuario
1. **Navegación:** Desde `/dashboard/users`, botón "Activar/Desactivar"
2. **Efecto:** Cambio inmediato de estado
3. **Seguridad:** Solo administradores

## 🔍 Filtros y Búsqueda

### Búsqueda
- **Campo:** Nombre, apellido o email
- **Tipo:** Búsqueda en tiempo real (debounce 300ms)
- **Case insensitive:** Sí

### Filtros
- **Todos los roles**
- **Solo clientes**
- **Solo abogados**
- **Solo administradores**

## 📈 Estadísticas del Dashboard

El dashboard muestra:
- **Total de usuarios**
- **Usuarios activos** (verde)
- **Usuarios inactivos** (rojo)
- **Conteo por rol:**
  - Clientes (verde)
  - Abogados (azul)
  - Administradores (rojo)

## 🚨 Validaciones Implementadas

### Frontend
- Email formato válido
- Contraseña mínimo 8 caracteres
- Confirmación de contraseña coincidente
- Nombres solo letras y espacios
- Campos obligatorios marcados

### Backend
- Email único en base de datos
- Hash seguro de contraseñas (bcrypt)
- Validación de roles permitidos
- Verificación de permisos de administrador
- Validación de dependencias antes de eliminar

## 🎯 Flujos de Usuario Recomendados

### 1. **Gestión Básica**
```
Login Admin → Dashboard Users → Ver lista → Crear usuario → Verificar en lista
```

### 2. **Edición Completa**
```
Login Admin → Dashboard Users → Editar usuario → Cambiar datos → Guardar → Verificar cambios
```

### 3. **Gestión de Estado**
```
Login Admin → Dashboard Users → Desactivar usuario → Confirmar en lista → Reactivar → Verificar
```

### 4. **Eliminación Controlada**
```
Login Admin → Dashboard Users → Intentar eliminar → Ver restricciones → Desactivar alternativa
```

## 🔧 Comandos de Desarrollo

### Iniciar servidor
```bash
npm run dev
```

### Verificar lint
```bash
npm run lint
```

### Conectar a base de datos
```bash
# Ver usuarios en PostgreSQL
psql -h localhost -p 5432 -U postgres -d lexconnect
SELECT id, email, first_name, last_name, role, is_active FROM users;
```

## 💡 Notas Importantes

1. **Autorización:** Todas las operaciones requieren rol de administrador
2. **Tokens:** Se incluye `Authorization: Bearer ${token}` en todas las peticiones
3. **Transacciones:** Operaciones de base de datos usan transacciones para integridad
4. **Cascada:** La eliminación verifica dependencias antes de proceder
5. **UI/UX:** Componentes shadcn/ui para consistencia visual
6. **Responsivo:** Interfaz adaptable a móviles y escritorio

## ⚠️ Restricciones de Seguridad

- ❌ Los administradores no pueden eliminarse a sí mismos
- ❌ No se puede eliminar usuarios con datos asociados
- ❌ Solo administradores acceden a la gestión de usuarios
- ❌ Tokens JWT requeridos para todas las operaciones
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de entrada en frontend y backend
- ✅ Rate limiting en funciones de autenticación