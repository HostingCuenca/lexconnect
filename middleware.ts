import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('🔄 MIDDLEWARE - Ejecutándose para:', pathname);

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard'];
  const authRoutes = ['/auth/login', '/auth/register'];
  
  // Admin-only routes
  const adminRoutes = ['/dashboard/users', '/dashboard/reports'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // CORRECCIÓN CRÍTICA: Usar el nombre correcto de la cookie que guarda AuthContext
  const userSession = request.cookies.get('lexconnect_token');
  console.log('🍪 MIDDLEWARE - Cookie lexconnect_token existe:', !!userSession);
  console.log('🍪 MIDDLEWARE - Valor de cookie:', userSession?.value ? 'Tiene valor' : 'No tiene valor');

  // Simple JWT decode for role checking (without full verification)
  let userRole: string | null = null;
  let userEmail: string | null = null;
  if (userSession?.value) {
    try {
      // Basic JWT decode (just for getting the role, full verification happens in API)
      const payload = JSON.parse(atob(userSession.value.split('.')[1]));
      userRole = payload.role;
      userEmail = payload.email;
      console.log('👤 MIDDLEWARE - Rol del usuario:', userRole);
      console.log('👤 MIDDLEWARE - Email del usuario:', userEmail);
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.log('⏰ MIDDLEWARE - Token expirado');
        userRole = null;
      } else {
        console.log('✅ MIDDLEWARE - Token válido');
      }
    } catch (error) {
      console.log('❌ MIDDLEWARE - Error decodificando token:', error);
      userRole = null;
    }
  }

  console.log('🛡️ MIDDLEWARE - Es ruta protegida:', isProtectedRoute);
  console.log('🔑 MIDDLEWARE - Es ruta de auth:', isAuthRoute);
  console.log('👨‍💼 MIDDLEWARE - Es ruta de admin:', isAdminRoute);

  // Redirect logic
  if (isProtectedRoute && !userSession) {
    console.log('🚫 MIDDLEWARE - Acceso denegado - Sin cookie, redirigiendo a login');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuthRoute && userSession) {
    console.log('✅ MIDDLEWARE - Usuario ya autenticado - Redirigiendo al dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Check admin-only routes
  if (isAdminRoute && (!userSession || userRole !== 'administrador')) {
    console.log('🛡️ MIDDLEWARE - Acceso admin denegado - Redirigiendo al dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('✅ MIDDLEWARE - Permite el acceso a:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap)
     * - robots.txt (robots file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};