import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Role-based access configuration ─────────────────────────────────────────
const ROLE_ACCESS: Record<string, string[]> = {
    stock_manager: ['/admin/inventory', '/admin/products', '/admin/categories', '/admin/orders'],
    order_manager: ['/admin/orders', '/admin/blog', '/admin/reviews'],
    admin: [], // empty means "all"
};

function isAllowed(role: string, pathname: string): boolean {
    if (role === 'admin') return true; // Super admin has access to everything
    const allowedPaths = ROLE_ACCESS[role] || [];
    return allowedPaths.some(allowed => pathname === allowed || pathname.startsWith(allowed + '/'));
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Prevent logged in users from seeing portal login again
  if (pathname.startsWith('/portal')) {
    if (token) {
      try {
        const [, payloadB64] = token.split('.');
        const payload = JSON.parse(
            Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );
        const role = payload.role;
        if (role === 'stock_manager') return NextResponse.redirect(new URL('/admin/inventory', request.url));
        if (role === 'order_manager') return NextResponse.redirect(new URL('/admin/orders', request.url));
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Protect Admin Routes
  if (pathname.startsWith('/admin')) {
    // Allow login page through (avoid redirect loop)
    if (pathname === '/admin/login' || pathname.startsWith('/admin/login/')) {
        return NextResponse.next();
    }

    if (!token) {
      // Not logged in → redirect to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode the JWT payload to check role
    try {
        const [, payloadB64] = token.split('.');
        const payload = JSON.parse(
            Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
        );
        const role: string = payload.role || '';

        // Managers trying to access /admin root → redirect to their allowed section
        if (pathname === '/admin' || pathname === '/admin/') {
            if (role === 'stock_manager') {
                return NextResponse.redirect(new URL('/admin/inventory', request.url));
            }
            if (role === 'order_manager') {
                return NextResponse.redirect(new URL('/admin/orders', request.url));
            }
        }

        // Check if the user has access to the requested path
        if (!isAllowed(role, pathname)) {
            if (role === 'stock_manager') {
                return NextResponse.redirect(new URL('/admin/inventory', request.url));
            }
            if (role === 'order_manager') {
                return NextResponse.redirect(new URL('/admin/orders', request.url));
            }
            // Customer or unknown role → redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }

        return NextResponse.next();
    } catch {
        // Token malformed
        return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
};
