# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production (static export)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Project Architecture

### Framework & Configuration
- **Next.js 13.5.1** with App Router and TypeScript
- **Static Export**: Configured with `output: 'export'` in next.config.js for static site generation
- **Tailwind CSS** with shadcn/ui component library
- **Authentication**: Mock implementation using localStorage (see AuthContext)

### Key Directory Structure
- `app/` - Next.js App Router pages and API routes
  - `api/` - API endpoints for blog and payments
  - `auth/` - Login and registration pages
  - `dashboard/` - Protected dashboard sections
- `components/` - React components
  - `ui/` - shadcn/ui components
  - `dashboard/` - Dashboard-specific components
- `contexts/` - React Context providers (AuthContext for user management)
- `lib/` - Utility functions and API helpers
- `hooks/` - Custom React hooks

### Authentication System
- Uses React Context (`AuthContext`) for state management
- Mock authentication with localStorage persistence
- Three user roles: `usuario`, `colaborador`, `administrador`
- Protected routes handled by middleware.ts

### UI Components
- Built with shadcn/ui and Radix UI primitives
- Tailwind CSS for styling with CSS variables for theming
- Components configured via `components.json`

### Important Notes
- **Static Export Limitations**: No server-side features like rewrites, API routes won't work in production build
- **Mock Data**: Authentication and some features use mock implementations
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **Spanish Language**: App is primarily in Spanish (LexConnect - legal services platform)

### Path Aliases
- `@/components` - Components directory
- `@/lib` - Library utilities
- `@/hooks` - Custom hooks
- `@/contexts` - React contexts

### Development Workflow
1. Always run `npm run lint` before committing changes
2. Test authentication flows with the mock system
3. Verify static export compatibility for new features
4. Use existing shadcn/ui components when possible