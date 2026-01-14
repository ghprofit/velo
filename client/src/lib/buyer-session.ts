import Cookies from 'js-cookie';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const SESSION_TOKEN_KEY = 'buyer_session_token';
const SESSION_EXPIRY_KEY = 'buyer_session_expiry';

export interface BuyerSession {
  sessionToken: string;
  expiresAt: string;
}

/**
 * Get browser fingerprint for session tracking
 */
export async function getBrowserFingerprint(): Promise<string> {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Failed to get browser fingerprint:', error);
    // Fallback to a simple hash based on user agent and screen
    const ua = navigator.userAgent;
    const screen = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${ua}-${screen}`).slice(0, 32);
  }
}

/**
 * Cache the fingerprint in sessionStorage for the current checkout session
 */
export function cacheBuyerFingerprint(fingerprint: string): void {
  try {
    sessionStorage.setItem('velo_checkout_fingerprint', fingerprint);
  } catch (error) {
    console.warn('Failed to cache fingerprint:', error);
  }
}

/**
 * Get the cached fingerprint from sessionStorage
 * Returns null if not found or expired
 */
export function getCachedBuyerFingerprint(): string | null {
  try {
    return sessionStorage.getItem('velo_checkout_fingerprint');
  } catch (error) {
    console.warn('Failed to get cached fingerprint:', error);
    return null;
  }
}

/**
 * Clear the cached fingerprint (call after successful purchase or checkout timeout)
 */
export function clearCachedBuyerFingerprint(): void {
  try {
    sessionStorage.removeItem('velo_checkout_fingerprint');
  } catch (error) {
    console.warn('Failed to clear cached fingerprint:', error);
  }
}

/**
 * Get or generate browser fingerprint - uses cached value if available
 * This ensures consistency across the checkout flow
 */
export async function getOrGenerateBrowserFingerprint(): Promise<string> {
  // Try to get cached fingerprint first
  const cached = getCachedBuyerFingerprint();
  if (cached) {
    return cached;
  }

  // Generate new fingerprint
  const fingerprint = await getBrowserFingerprint();

  // Cache it for future use
  cacheBuyerFingerprint(fingerprint);

  return fingerprint;
}

/**
 * Get current buyer session from localStorage
 */
export function getBuyerSession(): BuyerSession | null {
  if (typeof window === 'undefined') return null;

  const sessionToken = localStorage.getItem(SESSION_TOKEN_KEY);
  const expiresAt = localStorage.getItem(SESSION_EXPIRY_KEY);

  if (!sessionToken || !expiresAt) {
    return null;
  }

  // Check if session has expired
  if (new Date(expiresAt) < new Date()) {
    clearBuyerSession();
    return null;
  }

  return { sessionToken, expiresAt };
}

/**
 * Save buyer session to localStorage
 */
export function saveBuyerSession(session: BuyerSession): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(SESSION_TOKEN_KEY, session.sessionToken);
  localStorage.setItem(SESSION_EXPIRY_KEY, session.expiresAt);

  // Also save to cookies for server-side access (optional)
  const expiryDate = new Date(session.expiresAt);
  Cookies.set(SESSION_TOKEN_KEY, session.sessionToken, {
    expires: expiryDate,
    sameSite: 'strict',
  });
}

/**
 * Clear buyer session from localStorage
 */
export function clearBuyerSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
  Cookies.remove(SESSION_TOKEN_KEY);
}

/**
 * Get or create buyer session
 */
export async function getOrCreateSession(): Promise<string> {
  // Check for existing session
  const existingSession = getBuyerSession();
  if (existingSession) {
    return existingSession.sessionToken;
  }

  // Create new session
  // const fingerprint = await getBrowserFingerprint();

  // This would make an API call to create the session
  // For now, we'll return null to indicate the calling code should make the API call
  return '';
}

/**
 * Save purchase access token
 */
export function savePurchaseToken(contentId: string, accessToken: string): void {
  if (typeof window === 'undefined') return;

  const purchases = getPurchases();
  purchases[contentId] = accessToken;
  localStorage.setItem('buyer_purchases', JSON.stringify(purchases));
}

/**
 * Get purchase access token for content
 */
export function getPurchaseToken(contentId: string): string | null {
  if (typeof window === 'undefined') return null;

  const purchases = getPurchases();
  return purchases[contentId] || null;
}

/**
 * Get all purchases
 */
export function getPurchases(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const purchasesStr = localStorage.getItem('buyer_purchases');
  if (!purchasesStr) return {};

  try {
    return JSON.parse(purchasesStr);
  } catch {
    return {};
  }
}

/**
 * Clear purchase data
 */
export function clearPurchases(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('buyer_purchases');
}
