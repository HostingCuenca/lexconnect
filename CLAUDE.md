# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL: Development Guide

**BEFORE making ANY changes, READ the comprehensive development guide:**
📖 **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Contains all patterns, workflows, and best practices.

⚠️ **Key reminders for Claude Code:**
- Use centralized auth functions from `lib/auth.ts` - NEVER duplicate JWT logic
- Admin users (`role === 'administrador'`) can bypass author restrictions  
- Remove ALL debug logs before completing tasks
- Run `npm run lint` before finishing
- Follow established patterns, don't invent new ones

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Project Architecture

### Framework & Configuration
- **Next.js 13.5.1** with App Router and TypeScript
- **PostgreSQL Database**: Full production database with complex schema (see schema.sql)
- **Tailwind CSS** with shadcn/ui component library
- **Authentication**: JWT-based with PostgreSQL backend and cookie/localStorage persistence

### Key Directory Structure
- `app/` - Next.js App Router pages and API routes
  - `api/` - API endpoints (auth, blog, payments, admin)
  - `auth/` - Login and registration pages
  - `dashboard/` - Protected dashboard sections for different user roles
- `components/` - React components
  - `ui/` - shadcn/ui components (extensive Radix UI collection)
  - `dashboard/` - Dashboard-specific components
- `contexts/` - React Context providers (AuthContext for user management)
- `lib/` - Utility functions and database helpers
- `hooks/` - Custom React hooks
- `scripts/` - Database and admin utilities

### Database Architecture
- **PostgreSQL** with comprehensive schema for legal services platform
- **User Roles**: `cliente`, `abogado`, `administrador` (client, lawyer, admin)
- **Core Entities**: Users, Lawyer Profiles, Legal Specialties, Services, Consultations, Appointments, Payments, Blog Posts, Reviews
- **Database Config**: Located in lib/database.ts with connection pooling
- **Admin Script**: scripts/create-admin.js for creating initial admin user

### Authentication System
- JWT-based authentication with PostgreSQL backend
- React Context (`AuthContext`) for client-side state management
- Dual persistence: localStorage + httpOnly cookies
- Role-based middleware protection (middleware.ts)
- Three user roles with different dashboard access levels
- Admin routes protected at `/dashboard/users` and `/dashboard/reports`

### UI Components & Styling
- Built with shadcn/ui and extensive Radix UI primitives
- Tailwind CSS with CSS variables for comprehensive theming
- Components configured via `components.json` with path aliases
- Dark mode support via next-themes

### Build Configuration
- **Production Mode**: Static export commented out in next.config.js (currently in development mode)
- **Images**: Unoptimized with external domains (images.pexels.com)
- **ESLint**: Ignored during builds for development speed
- **TypeScript**: Strict mode with `@/*` path aliases

### Important Notes
- **Spanish Language**: LexConnect is a legal services platform primarily in Spanish
- **Database Connection**: Hardcoded credentials in database.ts (consider environment variables)
- **Role-Based Access**: Middleware handles route protection based on JWT role claims
- **Legal Domain**: App connects clients with lawyers, handles consultations, appointments, and payments

### Path Aliases (tsconfig.json & components.json)
- `@/components` - Components directory
- `@/lib` - Library utilities  
- `@/hooks` - Custom hooks
- `@/contexts` - React contexts
- `@/components/ui` - shadcn/ui components

### Development Workflow
1. **READ DEVELOPMENT_GUIDE.md first** 📖
2. Always run `npm run lint` before committing changes
3. Test authentication flows with different user roles
4. Use existing shadcn/ui components when possible
5. Consider database schema when adding new features
6. Admin user can be created via `node scripts/create-admin.js`

## 🔧 Quick Reference for Common Tasks

### Authentication Patterns
```typescript
// ✅ CORRECT - Use centralized auth
import { getAuthenticatedUser } from '@/lib/auth';
const user = getAuthenticatedUser(request);

// ❌ WRONG - Don't duplicate JWT logic
const decoded = jwt.verify(token, secret);
```

### Authorization Patterns
```typescript
// For admin OR owner operations
if (userRole !== 'administrador') {
  whereClause += ' AND author_id = $X';
  values.push(userId);
}
```

### API Route Structure
```typescript
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuth(request);
    const data = await request.json();
    const result = await businessFunction(data, user.userId, user.role);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
}
```

### Database Operations
```typescript
// Use transactions for complex operations
return withTransaction(async (client: PoolClient) => {
  const result = await client.query('...', [params]);
  return result.rows[0];
});
```

### Before Completing ANY Task
1. ✅ Remove all debug logs
2. ✅ Run `npm run lint`  
3. ✅ Test with different user roles
4. ✅ Verify admin can access everything