# Deployment Guide for LexConnect

Este documento contiene las instrucciones para deplogar LexConnect en Vercel.

## Pre-requisitos

1. Cuenta de Vercel (vercel.com)
2. Base de datos PostgreSQL accesible públicamente
3. Variables de entorno configuradas

## Variables de Entorno para Vercel

En el panel de Vercel, configura las siguientes variables de entorno:

### Base de Datos
```
DATABASE_URL=postgresql://username:password@host:port/database
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=lexconnectdb
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

### Autenticación
```
JWT_SECRET=your_very_long_random_jwt_secret_key_for_production
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=your_very_long_random_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Configuración
```
NODE_ENV=production
```

## Pasos para Deploy

### Opción 1: Deploy desde GitHub (Recomendado)

1. Sube tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Haz click en "New Project"
4. Importa tu repositorio desde GitHub
5. Configura las variables de entorno en la sección "Environment Variables"
6. Haz click en "Deploy"

### Opción 2: Deploy usando Vercel CLI

1. Instala Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login en Vercel:
   ```bash
   vercel login
   ```

3. Deploy desde la raíz del proyecto:
   ```bash
   vercel --prod
   ```

4. Configura las variables de entorno en el dashboard de Vercel

## Configuración Post-Deploy

1. **Dominio personalizado**: En el dashboard de Vercel, ve a Settings > Domains para configurar un dominio personalizado

2. **Variables de entorno**: Asegúrate de actualizar `NEXTAUTH_URL` con tu dominio final

3. **Base de datos**: Verifica que la base de datos sea accesible desde internet y tenga SSL habilitado

## Troubleshooting

### Error de Conexión a Base de Datos
- Verifica que la IP de Vercel esté permitida en tu firewall de base de datos
- Asegúrate de que SSL esté habilitado en tu configuración de PostgreSQL

### Errores de JWT
- Verifica que `JWT_SECRET` esté configurado y sea suficientemente largo
- Asegúrate de que `NEXTAUTH_SECRET` esté configurado

### Problemas de Build
- Revisa los logs de build en el dashboard de Vercel
- Asegúrate de que todas las dependencias estén en `package.json`

## Scripts Útiles

```bash
# Build local para verificar antes del deploy
npm run build

# Lint para verificar código
npm run lint

# Verificar tipos de TypeScript
npm run type-check
```

## Configuración de Base de Datos para Producción

Si necesitas ejecutar el script de admin en producción:

```bash
# Crear usuario admin (ejecutar localmente con variables de producción)
NODE_ENV=production node scripts/create-admin.js
```

## Monitoreo Post-Deploy

1. Verifica que todas las rutas funcionen correctamente
2. Prueba el login/registro
3. Verifica que las APIs respondan correctamente
4. Confirma que los diferentes roles de usuario funcionen

## Notas de Seguridad

- ✅ Nunca commites `.env.local` al repositorio
- ✅ Usa secretos fuertes para JWT y NextAuth
- ✅ Configura SSL/TLS en tu base de datos
- ✅ Restringe el acceso a tu base de datos solo a IPs necesarias

---

Para más información sobre deployment en Vercel, consulta la [documentación oficial](https://vercel.com/docs).