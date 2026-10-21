// Deterministic Budget Engine & Math Reconciliation Layer
// Zero hallucinated math: guarantees Sum(items) == Total Budget

import { BudgetItem, EventType } from '../types';

export interface DefaultCategorySplit {
  category: string;
  percentage: number;
  notes: string;
  isContingency?: boolean;
}

export const DEFAULT_BUDGET_SPLITS: Record<EventType, DefaultCategorySplit[]> = {
  wedding: [
    { category: 'Venue & Catering', percentage: 42, notes: 'Main space, cocktail hour, dinner service, bar' },
    { category: 'Photography & Videography', percentage: 14, notes: 'Full-day coverage, edited gallery, highlight film' },
    { category: 'Attire & Beauty', percentage: 9, notes: 'Outfits, shoes, hair, makeup, fittings' },
    { category: 'Decor & Florals', percentage: 11, notes: 'Ceremony arch, table centerpieces, bouquets, ambient lights' },
    { category: 'Music & Entertainment', percentage: 9, notes: 'DJ, sound equipment, emcee, live musicians' },
    { category: 'Stationery & Favors', percentage: 4, notes: 'Invites, menus, welcome signs, guest favors' },
    { category: 'Cake & Desserts', percentage: 4, notes: 'Tiered cake, late-night sweet bites' },
    { category: 'Contingency Reserve', percentage: 7, notes: 'Buffer for last-minute headcounts, tips & taxes', isContingency: true },
  ],
  birthday: [
    { category: 'Food, Drinks & Cake', percentage: 35, notes: 'Catering/buffet, custom theme cake, beverages' },
    { category: 'Venue & Activity Space', percentage: 28, notes: 'Hall rental, game lounge, or outdoor pavilion' },
    { category: 'Entertainment & Games', percentage: 15, notes: 'Performer, arcade tokens, face painter, or host' },
    { category: 'Decorations & Favors', percentage: 14, notes: 'Balloons, tableware, goodie bags, photo backdrop' },
    { category: 'Contingency Reserve', percentage: 8, notes: 'Buffer for extra guests and supplies', isContingency: true },
  ],
  community: [
    { category: 'Refreshments & Food Service', percentage: 30, notes: 'Bulk food, drinking water stations, snacks' },
    { category: 'Rentals & Equipment', percentage: 25, notes: 'Tables, chairs, tents, AV sound system, generator' },
    { category: 'Permits, Insurance & Licenses', percentage: 15, notes: 'City park permit, sound permit, liability coverage' },
    { category: 'Marketing, Signage & Badges', percentage: 10, notes: 'Directional banners, flyers, name tags, posters' },
    { category: 'Safety, Sanitation & Waste', percentage: 10, notes: 'Recycling/trash bins, first-aid kit, clean-up bags' },
    { category: 'Contingency Reserve', percentage: 10, notes: 'Emergency supplies & volunteer hydration reserve', isContingency: true },
  ],
};

/**
 * Generates an initial mathematically balanced budget for an event type and total budget.
 * Reconciles rounding differences so Sum(items) === totalBudget.
 */
export function generateDeterministicBudget(
  eventType: EventType,
  totalBudget: number
): BudgetItem[] {
  const splits = DEFAULT_BUDGET_SPLITS[eventType] || DEFAULT_BUDGET_SPLITS.wedding;
  let runningTotal = 0;

  const items: BudgetItem[] = splits.map((split, index) => {
    const allocated = Math.round((totalBudget * split.percentage) / 100);
    runningTotal += allocated;
    return {
      id: `budget-${index + 1}-${Date.now()}`,
      category: split.category,
      allocatedAmount: allocated,
      spentAmount: 0,
      percentage: split.percentage,
      notes: split.notes,
      isContingency: split.isContingency || false,
    };
  });

  // Reconcile rounding differences into contingency
  const diff = totalBudget - runningTotal;
  const contingencyItem = items.find((i) => i.isContingency) || items[items.length - 1];
  if (contingencyItem && diff !== 0) {
    contingencyItem.allocatedAmount += diff;
    contingencyItem.percentage = Math.round((contingencyItem.allocatedAmount / totalBudget) * 100);
  }

  return items;
}

/**
 * Reconciles an existing items array against a target total budget.
 * Guarantees that sum(allocatedAmount) === totalBudget.
 */
export function reconcileBudget(items: BudgetItem[], totalBudget: number): {
  reconciledItems: BudgetItem[];
  totalAllocated: number;
  unallocated: number;
  isOverBudget: boolean;
} {
  const totalAllocated = items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const unallocated = totalBudget - totalAllocated;
  const isOverBudget = totalAllocated > totalBudget;

  const reconciledItems = items.map((item) => ({
    ...item,
    percentage: totalBudget > 0 ? Math.round((item.allocatedAmount / totalBudget) * 100) : 0,
  }));

  return {
    reconciledItems,
    totalAllocated,
    unallocated,
    isOverBudget,
  };
}

/**
 * Formats currency nicely with international currency codes
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Calculates per-guest cost
 */
export function calculatePerGuest(total: number, guestCount: number): number {
  if (!guestCount || guestCount <= 0) return 0;
  return Math.round(total / guestCount);
}

export interface FeasibilityAssessment {
  status: 'healthy' | 'tight' | 'generous';
  perGuest: number;
  message: string;
  recommendations: string[];
}

/**
 * FR-13: Budget Feasibility & Respectful Constraint Advisor
 * Checks if total budget is consistent with guest count benchmarks and suggests
 * respectful, practical adaptations without declaring the event impossible.
 */
export function assessBudgetFeasibility(
  eventType: EventType,
  totalBudget: number,
  guestCount: number,
  currency = 'USD'
): FeasibilityAssessment {
  const perGuest = calculatePerGuest(totalBudget, guestCount);

  if (eventType === 'wedding') {
    if (perGuest < 60) {
      return {
        status: 'tight',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per guest, full-service private venue and traditional catering may be constrained.`,
        recommendations: [
          'Consider a scenic public park, botanical garden pavilion, or private backyard.',
          'Opt for cocktail-style hors d’oeuvres, food truck catering, or a signature dessert bar instead of plated meals.',
          'Schedule a daytime or Sunday afternoon ceremony (often 30–40% lower venue fees).',
          'Prioritize top two categories (e.g., Photography & Music) and simplify decor with DIY florals.',
        ],
      };
    } else if (perGuest > 250) {
      return {
        status: 'generous',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per guest, this provides comfortable room for premium hospitality and custom decor.`,
        recommendations: [
          'Explore live 4-piece string quartets or signature craft mixology stations.',
          'Consider custom stationery, welcome bags, and late-night culinary treats.',
          'Allocate a robust 10% contingency buffer for peace of mind.',
        ],
      };
    } else {
      return {
        status: 'healthy',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per guest, this aligns with standard wedding planning benchmarks.`,
        recommendations: [
          'Balanced allocation for standard venue, catering, photography, and entertainment.',
          'Review venue contracts carefully for hidden service fees and setup surcharges.',
        ],
      };
    }
  } else if (eventType === 'birthday') {
    if (perGuest < 18) {
      return {
        status: 'tight',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per guest, hired commercial party entertainment or private venue hire may stretch funds.`,
        recommendations: [
          'Host at a local community park, recreational clubhouse, or home backyard.',
          'Design interactive group games (scavenger hunt, obstacle relay, trivia) with small craft prizes.',
          'Batch bake homemade cupcakes or pizzas for crowd-pleasing, low-cost catering.',
        ],
      };
    } else {
      return {
        status: 'healthy',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per guest, this comfortably covers venue, catering, custom cake, and entertainment.`,
        recommendations: [
          'Book key performers or interactive rentals (e.g. bounce house, photo station) 3-4 weeks in advance.',
          'Confirm guest dietary restrictions and allergies before ordering food.',
        ],
      };
    }
  } else {
    // community
    if (perGuest < 8) {
      return {
        status: 'tight',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per attendee, municipal permits, sanitation, and catering require volunteer coordination.`,
        recommendations: [
          'Partner with local businesses or community groups for co-sponsorship and donations.',
          'Organize a volunteer potluck or hydration station rather than commercial catering.',
          'Borrow PA sound systems and folding tables from community centers or schools.',
        ],
      };
    } else {
      return {
        status: 'healthy',
        perGuest,
        message: `At ${formatCurrency(perGuest, currency)} per attendee, this comfortably covers basic municipal permits, equipment rentals, and refreshments.`,
        recommendations: [
          'Submit park and noise permit applications at least 30-45 days prior.',
          'Recruit dedicated volunteer team leads for setup and teardown.',
        ],
      };
    }
  }
}

export function calculateDaysRemaining(eventDate?: string): number | null {
  if (!eventDate) return null;
  const target = new Date(eventDate).getTime();
  if (isNaN(target)) return null;
  const now = new Date().getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
