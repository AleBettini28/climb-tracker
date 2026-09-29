export function outdoorPath(segment = ''): string {
  if (!segment) {
    return '/';
  }
  const clean = segment.startsWith('/') ? segment.slice(1) : segment;
  return `/${clean}`;
}

export function authPath(redirect?: string): string {
  if (!redirect) {
    return '/auth';
  }
  return `/auth?redirect=${encodeURIComponent(redirect)}`;
}

export function isSafeAppRedirect(path: string): boolean {
  if (!path.startsWith('/') || path.startsWith('//')) {
    return false;
  }
  if (path === '/auth' || path.startsWith('/auth/') || path.startsWith('/auth?')) {
    return false;
  }
  return true;
}

export function resolvePostAuthRedirect(redirect: string | null): string {
  if (redirect && isSafeAppRedirect(redirect)) {
    return redirect;
  }
  return outdoorPath('dashboard');
}
