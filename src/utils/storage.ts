// LocalStorage Persistence Layer for Planora
import { EventPlan } from '../types';
import { ALL_PRESET_PLANS, SAMPLE_WEDDING_PLAN } from './sampleData';

const STORAGE_KEY_PLANS_LEGACY = 'planora_event_plans_v1';
const STORAGE_KEY_ACTIVE = 'planora_active_plan_id_v1';
const STORAGE_KEY_GEMINI_KEY = 'planora_gemini_api_key_v1';

export function getUserStorageKey(userId?: string): string {
  if (userId) {
    return `planora_plans_user_${userId}`;
  }
  return 'planora_plans_guest_v1';
}

export function loadSavedPlans(userId?: string): EventPlan[] {
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enforce user ownership isolation
        if (userId) {
          return parsed.filter((p) => !p.userId || p.userId === userId).map((p) => ({ ...p, userId }));
        }
        return parsed.filter((p) => !p.userId || p.userId === 'guest');
      }
    }

    // Default seed strictly scoped to user or guest
    const initialPlans = ALL_PRESET_PLANS.map((p) => ({
      ...p,
      id: userId ? `${p.id}-${userId.slice(-6)}` : p.id,
      userId: userId || undefined,
    }));
    savePlans(initialPlans, userId);
    return initialPlans;
  } catch (err) {
    console.warn('Failed to load plans from localStorage, falling back to presets', err);
    return ALL_PRESET_PLANS.map((p) => ({ ...p, userId: userId || undefined }));
  }
}

export function savePlans(plans: EventPlan[], userId?: string) {
  try {
    const key = getUserStorageKey(userId);
    // Guarantee plan userId matches current session
    const securedPlans = plans.map((p) => ({
      ...p,
      userId: userId || undefined,
    }));
    localStorage.setItem(key, JSON.stringify(securedPlans));

    // Only update legacy storage for guest mode, never leak signed-in user plans
    if (!userId) {
      localStorage.setItem(STORAGE_KEY_PLANS_LEGACY, JSON.stringify(securedPlans));
    }
  } catch (err) {
    console.error('Failed to save plans to localStorage', err);
  }
}

/**
 * Priority 1.3: Backend/Storage Rule for Plan Ownership
 * Verifies whether a given user session is authorized to read, modify, or delete a plan.
 */
export function canUserAccessPlan(plan: EventPlan, currentUserId?: string): boolean {
  if (!plan) return false;
  // If plan is tied to a specific user account:
  if (plan.userId) {
    return Boolean(currentUserId && plan.userId === currentUserId);
  }
  // If plan has no owner (guest plan):
  // Guest can access, or signed-in user can claim it
  return true;
}

/**
 * Priority 1.4: Delete Individual Plan
 */
export function deleteStoredPlan(planId: string, userId?: string): EventPlan[] {
  const currentPlans = loadSavedPlans(userId);
  const updated = currentPlans.filter((p) => p.id !== planId);
  savePlans(updated, userId);
  return updated;
}

/**
 * Priority 1.4: Purge User Data on Account Deletion
 */
export function purgeUserData(userId: string) {
  try {
    const key = getUserStorageKey(userId);
    localStorage.removeItem(key);
  } catch {}
}

export function getActivePlanId(plans: EventPlan[]): string {
  try {
    const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (savedId && plans.some((p) => p.id === savedId)) {
      return savedId;
    }
  } catch {}
  return plans[0]?.id || SAMPLE_WEDDING_PLAN.id;
}

export function setActivePlanId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  } catch {}
}

export function getStoredApiKey(): string {
  try {
    return (
      localStorage.getItem(STORAGE_KEY_GEMINI_KEY) ||
      (import.meta as any).env?.VITE_OPENROUTER_API_KEY ||
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      ''
    );
  } catch {
    return '';
  }
}

export function isOpenRouterKey(key?: string): boolean {
  const k = key || getStoredApiKey();
  return Boolean(k && (k.startsWith('sk-or-') || k.startsWith('sk-')));
}

export function setStoredApiKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  } catch {}
}
