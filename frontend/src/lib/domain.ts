export const ADMIN_DOMAIN = 'admin.clawdesktop.vn';

export type DomainMode = 'admin-only' | 'user-only' | 'both';

export function getDomainMode(): DomainMode {
  if (typeof window === 'undefined') return 'user-only';
  const hostname = window.location.hostname;
  if (hostname === ADMIN_DOMAIN) return 'admin-only';
  if (hostname === 'localhost') return 'both';
  return 'user-only';
}

export function isAdminOnlyDomain(): boolean {
  return getDomainMode() === 'admin-only';
}

export function isAdminAllowedDomain(): boolean {
  const mode = getDomainMode();
  return mode === 'admin-only' || mode === 'both';
}

export function getAdminOrigin(): string {
  return `https://${ADMIN_DOMAIN}`;
}
