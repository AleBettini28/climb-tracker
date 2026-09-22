export const OUTDOOR_BASE = '/outdoor-tracker';
export const GYM_BASE = '/gym-tracker';

export function outdoorPath(segment = ''): string {
  if (!segment) {
    return OUTDOOR_BASE;
  }
  const clean = segment.startsWith('/') ? segment.slice(1) : segment;
  return `${OUTDOOR_BASE}/${clean}`;
}

export function gymPath(segment = ''): string {
  if (!segment) {
    return GYM_BASE;
  }
  const clean = segment.startsWith('/') ? segment.slice(1) : segment;
  return `${GYM_BASE}/${clean}`;
}

export function authPath(redirect?: string): string {
  if (!redirect) {
    return '/auth';
  }
  return `/auth?redirect=${encodeURIComponent(redirect)}`;
}

export function isSafeAppRedirect(path: string): boolean {
  return (
    path.startsWith(`${OUTDOOR_BASE}/`) ||
    path === OUTDOOR_BASE ||
    path.startsWith(`${GYM_BASE}/`) ||
    path === GYM_BASE
  );
}

export function resolvePostAuthRedirect(redirect: string | null): string {
  if (redirect && isSafeAppRedirect(redirect)) {
    return redirect;
  }
  return outdoorPath('dashboard');
}

export function zoneHomeFromPath(pathname: string): string {
  if (pathname.startsWith(GYM_BASE)) {
    return gymPath('palestre');
  }
  if (pathname.startsWith(OUTDOOR_BASE)) {
    return outdoorPath('esplora');
  }
  return '/';
}
