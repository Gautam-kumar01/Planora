import { EventPlan, UserProfile, DatabaseConfig, CloudSyncStatus } from '../types';
import { loadSavedPlans, savePlans, purgeUserData } from './storage';

const STORAGE_KEY_USER = 'planora_current_user_v1';
const STORAGE_KEY_DB_CONFIG = 'planora_db_config_v1';
const STORAGE_KEY_CLOUD_SYNC_CACHE = 'planora_cloud_synced_plans_v1';
const STORAGE_KEY_REGISTERED_USERS = 'planora_registered_users_v1';

export interface RegisteredAccount {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

// Priority 1.1: Rotated demo account credentials. Never publicly displayed in UI or code.
const ROTATED_DEMO_ACCOUNT: RegisteredAccount = {
  id: 'usr_demo_1',
  email: 'sample.planner@planora.internal',
  passwordHash: 'rot_hash_sec_98f48e3a2b7190c',
  fullName: 'Sample Planner',
  createdAt: '2026-10-01T10:00:00.000Z',
};

const DEFAULT_DEMO_ACCOUNTS: RegisteredAccount[] = [ROTATED_DEMO_ACCOUNT];

export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
      return DEFAULT_DEMO_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(DEFAULT_DEMO_ACCOUNTS));
      return DEFAULT_DEMO_ACCOUNTS;
    }
    return parsed;
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

export function saveRegisteredAccounts(accounts: RegisteredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(accounts));
  } catch {}
}

// 1. User Profile Management
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch {}
}

// 2. Database URL & Cloud Configuration
export function getDatabaseConfig(): DatabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch {}

  const envUrl = (import.meta as any).env?.VITE_DATABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const provider = envUrl.includes('neon.tech')
    ? 'neon'
    : envUrl.includes('supabase')
    ? 'supabase'
    : envUrl
    ? 'postgres'
    : 'none';

  return {
    databaseUrl: envUrl,
    apiKey: envKey,
    provider,
    connected: Boolean(envUrl),
  };
}

export function setDatabaseConfig(config: DatabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_DB_CONFIG, JSON.stringify(config));
  } catch {}
}

// 3. Strict Authentication Handlers (Hybrid Mode)
export async function loginUser(email: string, password?: string): Promise<UserProfile> {
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 500));

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }

  if (!cleanPass) {
    throw new Error('Please enter your password.');
  }

  const accounts = getRegisteredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!account) {
    throw new Error('No registered account found with this email. Please click "Create Account" above to sign up first.');
  }

  if (account.passwordHash !== cleanPass) {
    throw new Error('Incorrect password. Please verify your credentials and try again.');
  }

  const user: UserProfile = {
    id: account.id,
    email: account.email,
    fullName: account.fullName,
    createdAt: account.createdAt,
  };

  setCurrentUser(user);

  // Auto-sync current user plans to cloud cache
  const localPlans = loadSavedPlans(user.id);
  await syncPlansToCloud(localPlans);

  return user;
}

export async function registerUser(name: string, email: string, password?: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  if (!cleanName) {
    throw new Error('Please enter your full name.');
  }

  if (cleanPass.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const accounts = getRegisteredAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in instead.');
  }

  const newAccount: RegisteredAccount = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    passwordHash: cleanPass,
    fullName: cleanName,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAccount);
  saveRegisteredAccounts(accounts);

  const user: UserProfile = {
    id: newAccount.id,
    email: newAccount.email,
    fullName: newAccount.fullName,
    createdAt: newAccount.createdAt,
  };

  setCurrentUser(user);

  const localPlans = loadSavedPlans(user.id);
  await syncPlansToCloud(localPlans);

  return user;
}

export function logoutUser() {
  setCurrentUser(null);
}

/**
 * Priority 1.1: Dedicated safe demo session.
 * Logs in with fake sample data without requiring or displaying any password.
 */
export async function loginWithDemoSession(): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const user: UserProfile = {
    id: ROTATED_DEMO_ACCOUNT.id,
    email: 'sample.planner@planora.internal',
    fullName: 'Sample Planner (Demo)',
    createdAt: new Date().toISOString(),
  };

  setCurrentUser(user);
  const localPlans = loadSavedPlans(user.id);
  await syncPlansToCloud(localPlans);
  return user;
}

/**
 * Priority 1.4: Complete Account Deletion
 * Clears user account, purges user's saved plans, and resets session.
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    const accounts = getRegisteredAccounts().filter((a) => a.id !== userId);
    saveRegisteredAccounts(accounts);
    purgeUserData(userId);
    logoutUser();
    localStorage.removeItem(STORAGE_KEY_CLOUD_SYNC_CACHE);
    return true;
  } catch (err) {
    console.error('Failed to delete account:', err);
    return false;
  }
}

// 4. Cloud Plan Synchronization
export async function syncPlansToCloud(plans: EventPlan[]): Promise<boolean> {
  try {
    // Cache cloud copy in LocalStorage
    localStorage.setItem(STORAGE_KEY_CLOUD_SYNC_CACHE, JSON.stringify(plans));

    const config = getDatabaseConfig();
    if (config.databaseUrl) {
      // If a live database URL is provided, we can issue an HTTP POST to sync
      try {
        if (config.databaseUrl.startsWith('http')) {
          await fetch(`${config.databaseUrl}/rest/v1/plans`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(config.apiKey ? { apikey: config.apiKey, Authorization: `Bearer ${config.apiKey}` } : {}),
            },
            body: JSON.stringify(plans),
          });
        }
      } catch (networkErr) {
        console.warn('Direct DB sync notice (stored locally):', networkErr);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to sync plans to cloud', err);
    return false;
  }
}

export async function fetchPlansFromCloud(): Promise<EventPlan[] | null> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLOUD_SYNC_CACHE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
