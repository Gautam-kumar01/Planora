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
        return parsed;
      }
    }

    // Check legacy storage migration if user or guest doesn't have plans yet
    const legacyRaw = localStorage.getItem(STORAGE_KEY_PLANS_LEGACY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        const migrated = legacyParsed.map((p) => ({
          ...p,
          ...(userId ? { userId } : {}),
        }));
        savePlans(migrated, userId);
        return migrated;
      }
    }

    // Default seed
    const initialPlans = ALL_PRESET_PLANS.map((p) => ({
      ...p,
      ...(userId ? { userId } : {}),
    }));
    savePlans(initialPlans, userId);
    return initialPlans;
  } catch (err) {
    console.warn('Failed to load plans from localStorage, falling back to presets', err);
    return ALL_PRESET_PLANS;
  }
}

export function savePlans(plans: EventPlan[], userId?: string) {
  try {
    const key = getUserStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(plans));
    // Also update legacy for backward compatibility
    localStorage.setItem(STORAGE_KEY_PLANS_LEGACY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save plans to localStorage', err);
  }
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
