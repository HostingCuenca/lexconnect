# 🧑‍⚖️ Datos de Abogados para Testing - LexConnect Ecuador

Este archivo contiene los datos reales de los usuarios y abogados en la base de datos de LexConnect para facilitar el testing del dashboard administrativo.

## 🔐 Credenciales de Acceso

### 👮‍♂️ **Usuario Administrador**
- **Email:** `admin@lexconnect.mx`
- **Password:** `admin123`
- **Rol:** administrador
- **Acceso:** Dashboard completo + Administrar Abogados

**Navegación:** Dashboard → Administrar Abogados (`/dashboard/lawyers`)

---

## ⚖️ Abogados Registrados

### 1. Dra. María González
- **Email:** `dra.gonzalez@lexconnect.mx`
- **Password:** `password123`
- **Teléfono:** +52 555 111 2222
- **Especialidad:** Derecho Civil
- **Experiencia:** 15 años
- **Estado:** ✅ Verificado
- **Educación:** Licenciatura en Derecho - UNAM, Maestría en Derecho Civil
- **Cédula:** LIC-001-2020
- **Colegio:** Colegio de Abogados de México
- **Ubicación:** Av. Reforma 123, Col. Centro, Ciudad de México
- **Idiomas:** Español, Inglés
- **Tarifa por hora:** $800
- **Consulta:** $200

**Horarios:**
- Lunes a Jueves: 9:00 AM - 6:00 PM
- Viernes: 9:00 AM - 5:00 PM

**Servicios:**
- Consulta Legal - Derecho Civil ($200, 60 min)
- Revisión de Contratos ($150, 45 min)

---

### 2. Lic. Carlos Ruiz
- **Email:** `lic.ruiz@lexconnect.mx`
- **Password:** `password123`
- **Teléfono:** +52 555 333 4444
- **Especialidad:** Derecho Penal
- **Experiencia:** 12 años
- **Estado:** ✅ Verificado
- **Educación:** Licenciatura en Derecho - ITAM, Especialidad en Derecho Penal
- **Cédula:** LIC-002-2018
- **Colegio:** Barra de Abogados Mexicana
- **Ubicación:** Insurgentes Sur 456, Col. Roma Norte, Ciudad de México
- **Idiomas:** Español
- **Tarifa por hora:** $900
- **Consulta:** $350

**Horarios:**
- Lunes a Jueves: 10:00 AM - 7:00 PM
- Viernes: 10:00 AM - 6:00 PM

**Servicios:**
- Defensa Penal Especializada ($350, 90 min)
- Asesoría en Procedimiento Penal ($250, 60 min)

---

### 3. Dr. Roberto Martín
- **Email:** `dr.martin@lexconnect.mx`
- **Password:** `password123`
- **Teléfono:** +52 555 555 6666
- **Especialidad:** Derecho Mercantil
- **Experiencia:** 18 años
- **Estado:** ✅ Verificado
- **Educación:** Licenciatura en Derecho - UP, Maestría en Derecho Corporativo
- **Cédula:** LIC-003-2015
- **Colegio:** Colegio Nacional de Abogados
- **Ubicación:** Polanco 789, Col. Polanco, Ciudad de México
- **Idiomas:** Español, Inglés, Francés
- **Tarifa por hora:** $1,200
- **Consulta:** $500

**Horarios:**
- Lunes a Jueves: 8:00 AM - 6:00 PM
- Viernes: 8:00 AM - 4:00 PM

**Servicios:**
- Constitución de Empresas ($500, 120 min)
- Consultoría Corporativa ($800, 90 min)

---

### 4. Lic. Ana Herrera
- **Email:** `lic.herrera@lexconnect.mx`
- **Password:** `password123`
- **Teléfono:** +52 555 777 8888
- **Especialidad:** Derecho Inmobiliario
- **Experiencia:** 8 años
- **Estado:** ✅ Verificado
- **Educación:** Licenciatura en Derecho - UNAM, Especialidad en Derecho Inmobiliario
- **Cédula:** LIC-004-2019
- **Colegio:** Colegio de Abogados de México
- **Ubicación:** Santa Fe 321, Col. Santa Fe, Ciudad de México
- **Idiomas:** Español, Inglés
- **Tarifa por hora:** $700
- **Consulta:** $180

**Horarios:**
- Lunes a Jueves: 9:00 AM - 5:00 PM
- Viernes: 9:00 AM - 3:00 PM

**Servicios:**
- Asesoría Inmobiliaria ($180, 45 min)
- Trámites de Escrituración ($400, 75 min)

---

### 5. Dr. Luis Fernández
- **Email:** `dr.fernandez@lexconnect.mx`
- **Password:** `password123`
- **Teléfono:** +52 555 999 0000
- **Especialidad:** Derecho Laboral
- **Experiencia:** 20 años
- **Estado:** ✅ Verificado
- **Educación:** Licenciatura en Derecho - UAM, Maestría en Derecho Laboral
- **Cédula:** LIC-005-2017
- **Colegio:** Barra de Abogados Mexicana
- **Ubicación:** Doctores 654, Col. Doctores, Ciudad de México
- **Idiomas:** Español
- **Tarifa por hora:** $850
- **Consulta:** $280

**Horarios:**
- Lunes a Viernes: 8:30 AM - 5:30 PM
- Viernes: 8:30 AM - 4:30 PM

**Servicios:**
- Derecho Laboral y Despidos ($280, 75 min)
- Revisión de Contratos Laborales ($200, 60 min)

---

## 👥 Clientes Registrados

### Cliente 1: María García
- **Email:** `maria.garcia@email.com`
- **Password:** `password123`
- **Teléfono:** +52 555 123 4567
- **Rol:** cliente

### Cliente 2: Carlos López
- **Email:** `carlos.lopez@email.com`
- **Password:** `password123`
- **Teléfono:** +52 555 234 5678
- **Rol:** cliente

### Cliente 3: Ana Martínez
- **Email:** `ana.martinez@email.com`
- **Password:** `password123`
- **Teléfono:** +52 555 345 6789
- **Rol:** cliente

---

## 🎯 Funcionalidades del Dashboard Administrativo

### 📋 Vista Principal (`/dashboard/lawyers`)
- **Estadísticas globales:** 
  - Total abogados: 5
  - Verificados: 5 
  - Servicios totales: 10
  - Consultas acumuladas: Variable según actividad

- **Lista completa** con información resumida de cada abogado
- **Filtros:** Por especialidad, estado de verificación, búsqueda por nombre/email
- **Acciones rápidas:** Ver perfil, editar, eliminar

### 👁️ Vista Detallada (`/dashboard/lawyers/[id]`)
- **Información personal:** Contacto, ubicación, idiomas
- **Información profesional:** Educación, experiencia, credenciales  
- **Servicios:** Lista completa con precios, duración, tipo
- **Horarios:** Disponibilidad semanal detallada
- **Estadísticas:** Tarifas, verificación, experiencia

### ✏️ Formularios CRUD (A implementar)
- **Crear:** Nuevo abogado con perfil completo
- **Editar:** Modificar información existente  
- **Eliminar:** Confirmación y eliminación segura
- **Verificar:** Cambiar estado de verificación

---

## 🧪 Casos de Prueba Recomendados

### ✅ Login y Navegación
1. **Login Admin:** `admin@lexconnect.mx` / `admin123`
2. **Acceder a Lista:** `/dashboard/lawyers`
3. **Ver Detalles:** Click en cualquier abogado

### 🔍 Filtros y Búsqueda
1. **Buscar por nombre:** "María", "Carlos", "Roberto"
2. **Buscar por email:** "dra.gonzalez", "lic.ruiz"
3. **Filtrar por especialidad:** 
   - Derecho Civil (María González)
   - Derecho Penal (Carlos Ruiz)
   - Derecho Mercantil (Roberto Martín)
   - Derecho Inmobiliario (Ana Herrera)
   - Derecho Laboral (Luis Fernández)

### 📊 Verificación de Datos
1. **Estadísticas:** Verificar totales y cálculos
2. **Información personal:** Revisar emails, teléfonos, direcciones
3. **Servicios:** Confirmar precios y duraciones
4. **Horarios:** Verificar disponibilidad por día

### 🧑‍⚖️ Login como Abogado (Testing)
Cualquier abogado puede hacer login para ver su dashboard:
```
Email: dra.gonzalez@lexconnect.mx
Password: password123
→ Ve solo SU información en /dashboard
```

### 👤 Login como Cliente (Testing)
Cualquier cliente puede hacer login:
```
Email: maria.garcia@email.com  
Password: password123
→ Acceso limitado, sin dashboard de abogados
```

---

## 🚀 URLs de Testing

- **Login:** http://localhost:3001/auth/login
- **Dashboard Admin:** http://localhost:3001/dashboard
- **Lista Abogados:** http://localhost:3001/dashboard/lawyers
- **Detalle Abogado:** http://localhost:3001/dashboard/lawyers/[id]
- **Vista Pública:** http://localhost:3001/lawyers/[id]
- **Servicios Públicos:** http://localhost:3001/services

---

## 🔐 Niveles de Autorización

### 👮‍♂️ **Administrador** (`admin@lexconnect.mx`)
- ✅ Ver todos los abogados y sus datos completos
- ✅ Crear nuevos abogados (A implementar)
- ✅ Editar cualquier perfil (A implementar)
- ✅ Eliminar abogados (A implementar)
- ✅ Verificar/desverificar perfiles
- ✅ Acceso a estadísticas globales
- ✅ Gestionar servicios de cualquier abogado

### ⚖️ **Abogado** (ej: `dra.gonzalez@lexconnect.mx`)
- ✅ Ver solo su propio perfil
- ✅ Editar su información personal
- ✅ Gestionar sus propios servicios
- ❌ No puede ver otros abogados en el dashboard
- ❌ No puede crear/eliminar cuentas

### 👤 **Cliente** (ej: `maria.garcia@email.com`)
- ❌ Sin acceso al dashboard de administración
- ✅ Solo puede ver perfiles públicos en `/lawyers/[id]`
- ✅ Puede solicitar consultas

---

## 📝 Estructura de Base de Datos

### Tabla `users` (Autenticación)
```sql
id, email, password_hash, first_name, last_name, 
phone, role, email_verified, is_active, created_at, updated_at
```

### Tabla `lawyer_profiles` (Información Profesional)
```sql
id, user_id, license_number, bar_association, years_experience,
education, bio, hourly_rate, consultation_rate, office_address,
languages, availability_schedule, is_verified, rating, total_reviews,
total_consultations, created_at, updated_at
```

### Tabla `lawyer_services` (Servicios)
```sql
id, lawyer_id, title, description, price, duration_minutes,
service_type, status, requirements, deliverables, created_at, updated_at
```

---

## 🔧 Próximas Implementaciones

1. **✏️ Formulario Crear Abogado** (`/dashboard/lawyers/create`)
2. **📝 Formulario Editar Abogado** (`/dashboard/lawyers/[id]/edit`)
3. **🗑️ Confirmación de Eliminación**
4. **✅ Toggle Verificación**
5. **📊 Exportar Datos**
6. **🔍 Filtros Avanzados**

---

**Última actualización:** Enero 2025  
**Plataforma:** LexConnect Ecuador v1.0  
**Base de Datos:** PostgreSQL en producción