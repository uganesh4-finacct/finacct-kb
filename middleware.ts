import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/lib/types'

const PUBLIC_PATHS = ['/', '/login', '/reset-password', '/auth/confirm', '/auth/accept-invite', '/auth/accept-invite/confirm', '/update-password']
const TRAINING_PATH = '/training'
const ADMIN_PATH = '/admin'
const SECTION_PATH = '/section'
const TEMPLATES_PATH = '/templates'

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isTrainingPath(pathname: string): boolean {
  return pathname === TRAINING_PATH || pathname.startsWith(TRAINING_PATH + '/')
}

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH || pathname.startsWith(ADMIN_PATH + '/')
}

function isSectionPath(pathname: string): boolean {
  return pathname.startsWith(SECTION_PATH + '/')
}

function isTemplatesPath(pathname: string): boolean {
  return pathname === TEMPLATES_PATH || pathname.startsWith(TEMPLATES_PATH + '/')
}

function isHomePath(pathname: string): boolean {
  return pathname === '/home' || pathname.startsWith('/home/')
}

function isCertificatePath(pathname: string): boolean {
  return pathname === '/certificate' || pathname.startsWith('/certificate/')
}

function isSearchPath(pathname: string): boolean {
  return pathname === '/search' || pathname.startsWith('/search')
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  if (!user) {
    if (!isPublicPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    return response
  }

  // Fetch profile for role, training status, and needs_password_set (fresh from DB every request, no cache)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, training_completed, needs_password_set')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[Middleware] Profile fetch error:', profileError.message, 'code:', profileError.code, 'for user', user.id)
  }

  // Invited users must set a password before using the app; send them to set-password page
  if (profile?.needs_password_set === true && pathname !== '/update-password' && pathname !== '/auth/accept-invite' && pathname !== '/auth/accept-invite/confirm' && pathname !== '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/update-password'
    return NextResponse.redirect(url)
  }

  const rawRole = (profile?.role as string | undefined)?.toLowerCase()
  const validRoles: UserRole[] = ['admin', 'editor', 'accountant', 'trainee']
  const role: UserRole = rawRole && validRoles.includes(rawRole as UserRole) ? (rawRole as UserRole) : 'accountant'

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] User role:', role, '| Source: profiles table | profile:', profile ? 'found' : 'null', '| rawRole:', rawRole ?? 'undefined')
  }

  // Certificate: only if training completed (all modules passed)
  if (isCertificatePath(pathname) && !profile?.training_completed) {
    const url = request.nextUrl.clone()
    url.pathname = TRAINING_PATH
    return NextResponse.redirect(url)
  }

  // Trainee: only /home, /training/*, /certificate (when complete), /search (no /section/*, /templates/*, /admin/*)
  if (role === 'trainee') {
    if (isAdminPath(pathname) || isSectionPath(pathname) || isTemplatesPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = TRAINING_PATH
      return NextResponse.redirect(url)
    }
    if (!isHomePath(pathname) && !isTrainingPath(pathname) && !isCertificatePath(pathname) && !isSearchPath(pathname) && pathname !== '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return response
  }

  // Accountant: full KB access, no /admin/*
  if (role === 'accountant') {
    if (isAdminPath(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = '/home'
      return NextResponse.redirect(url)
    }
    return response
  }

  // Admin: full access
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
