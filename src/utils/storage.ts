// LocalStorage Persistence Layer for Planora
import { EventPlan } from '../types';
import { ALL_PRESET_PLANS, SAMPLE_WEDDING_PLAN } from './sampleData';

const STORAGE_KEY_PLANS_LEGACY = 'planora_event_plans_v1';
const STORAGE_KEY_ACTIVE = 'planora_active_plan_id_v1';
const STORAGE_KEY_GEMINI_KEY = 'planora_gemini_api_key_v1';

/**
 * Checks whether an event plan or plan ID is a pre-built static preset.
 * Preset plans are intended ONLY for homepage demonstration and showcases.
 */
export function isPresetPlan(planOrId: EventPlan | string): boolean {
  if (!planOrId) return false;
  const id = typeof planOrId === 'string' ? planOrId : planOrId.id;
  return (
    id.startsWith('preset-') ||
    id === 'preset-wedding-01' ||
    id === 'preset-birthday-01' ||
    id === 'preset-community-01'
  );
}

export function getUserStorageKey(userId?: string): string {
  if (userId) {
    return `planora_plans_user_${userId}`;
  }
  return 'planora_plans_guest_v1';
}

/**
 * Loads saved event plans with strict user ownership isolation.
 * - When a user is logged in (userId provided), it ONLY returns plans created by that user.
 * - Logged-in users will NEVER receive pre-built preset plans in their dashboard.
 * - If a logged-in user has not created any plans yet, this returns an empty array [].
 * - In Guest Mode (!userId), returns local guest plans or defaults to homepage presets.
 */
export function loadSavedPlans(userId?: string): EventPlan[] {
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);

    if (userId) {
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Strictly filter only plans belonging to this user and exclude pre-built presets
          const userPlans = parsed.filter(
            (p: EventPlan) => p.userId === userId && !isPresetPlan(p.id)
          );
          return userPlans;
        }
      }
      // If user has not created any plans yet, return empty list (NO pre-built plans in user dashboard)
      return [];
    }

    // Guest Mode (not signed in):
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Default seed for guest mode / homepage demo visitors
    return ALL_PRESET_PLANS;
  } catch (err) {
    console.warn('Failed to load plans from localStorage', err);
    return userId ? [] : ALL_PRESET_PLANS;
  }
}

/**
 * Saves event plans strictly scoped to the active user session.
 */
export function savePlans(plans: EventPlan[], userId?: string) {
  try {
    const key = getUserStorageKey(userId);

    if (userId) {
      // Guarantee each plan is assigned to the current user ID and exclude presets from user storage
      const securedPlans = plans
        .filter((p) => !isPresetPlan(p.id))
        .map((p) => ({
          ...p,
          userId,
        }));
      localStorage.setItem(key, JSON.stringify(securedPlans));
    } else {
      // Guest mode
      const guestPlans = plans.map((p) => ({
        ...p,
        userId: undefined,
      }));
      localStorage.setItem(key, JSON.stringify(guestPlans));
      localStorage.setItem(STORAGE_KEY_PLANS_LEGACY, JSON.stringify(guestPlans));
    }
  } catch (err) {
    console.error('Failed to save plans to localStorage', err);
  }
}

/**
 * Backend/Storage Rule for Plan Ownership:
 * Verifies whether a given user session is authorized to read, modify, or delete a plan.
 * - If currentUserId is provided, the user can ONLY access plans where plan.userId === currentUserId.
 * - A logged-in user CANNOT access another user's plan or access pre-built presets as their workspace.
 * - In Guest Mode, guests can access unowned plans or demo presets.
 */
export function canUserAccessPlan(plan: EventPlan, currentUserId?: string): boolean {
  if (!plan) return false;
  
  if (currentUserId) {
    return Boolean(plan.userId && plan.userId === currentUserId && !isPresetPlan(plan.id));
  }

  // Guest Mode
  return !plan.userId || isPresetPlan(plan.id);
}

/**
 * Delete Individual Plan
 */
export function deleteStoredPlan(planId: string, userId?: string): EventPlan[] {
  const currentPlans = loadSavedPlans(userId);
  const updated = currentPlans.filter((p) => p.id !== planId);
  savePlans(updated, userId);
  return updated;
}

/**
 * Purge User Data on Account Deletion
 */
export function purgeUserData(userId: string) {
  try {
    const key = getUserStorageKey(userId);
    localStorage.removeItem(key);
    localStorage.removeItem(`planora_active_plan_${userId}`);
  } catch {}
}

export function getActivePlanId(plans: EventPlan[], userId?: string): string {
  try {
    const key = userId ? `planora_active_plan_${userId}` : STORAGE_KEY_ACTIVE;
    const savedId = localStorage.getItem(key);
    if (savedId && plans.some((p) => p.id === savedId)) {
      return savedId;
    }
  } catch {}
  return plans[0]?.id || '';
}

export function setActivePlanId(id: string, userId?: string) {
  try {
    const key = userId ? `planora_active_plan_${userId}` : STORAGE_KEY_ACTIVE;
    localStorage.setItem(key, id);
    if (!userId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, id);
    }
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
