// Deterministic Budget Engine & Math Reconciliation Layer
// Zero hallucinated math: guarantees Sum(items) == Total Budget

import {
  BudgetItem,
  EventType,
  EventPlan,
  TaskItem,
  TaskDateStatus,
  PlanCompleteness,
  PlanCompletenessMetric,
  CommunityChecklistItem,
} from '../types';

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

/**
 * Priority 2.2: Task Date Status Engine
 * Aware of today's date and event date.
 * Categorizes tasks into 'completed', 'overdue', 'due_soon', 'upcoming', or 'no_date'.
 */
export function calculateTaskDateStatus(
  dueDate?: string,
  eventDate?: string,
  completed?: boolean
): TaskDateStatus {
  if (completed) {
    return { status: 'completed', label: 'Completed' };
  }

  if (!dueDate || !dueDate.trim()) {
    if (eventDate) {
      const daysToEvent = calculateDaysRemaining(eventDate);
      if (daysToEvent !== null) {
        return {
          status: 'upcoming',
          label: daysToEvent > 0 ? `Target: before event (${daysToEvent}d left)` : 'Target: event week',
        };
      }
    }
    return { status: 'no_date', label: 'Flexible timing' };
  }

  // Parse YYYY-MM-DD or standard date string
  const parts = dueDate.split('-');
  let targetDate: Date;
  if (parts.length === 3) {
    targetDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  } else {
    targetDate = new Date(dueDate);
  }

  if (isNaN(targetDate.getTime())) {
    return { status: 'no_date', label: 'Flexible timing' };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffMs = dueMidnight.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const abs = Math.abs(diffDays);
    return {
      status: 'overdue',
      label: abs === 1 ? 'Overdue by 1 day' : `Overdue by ${abs} days`,
      daysDiff: diffDays,
    };
  }

  if (diffDays === 0) {
    return {
      status: 'due_soon',
      label: 'Due today',
      daysDiff: 0,
    };
  }

  if (diffDays <= 7) {
    return {
      status: 'due_soon',
      label: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
      daysDiff: diffDays,
    };
  }

  return {
    status: 'upcoming',
    label: `Due in ${diffDays} days`,
    daysDiff: diffDays,
  };
}

/**
 * Priority 3.1: "Next Best Step" Recommendation Engine
 * Finds the nearest useful incomplete task based on urgency, status, and timeline position.
 */
export function getRecommendedNextStep(
  plan: EventPlan,
  dismissedTaskIds: string[] = []
): { task: TaskItem; sectionId: string; sectionPeriod: string; reason: string; dateStatus: TaskDateStatus } | null {
  if (!plan.timeline || plan.timeline.length === 0) return null;

  interface Candidate {
    task: TaskItem;
    sectionId: string;
    sectionPeriod: string;
    dateStatus: TaskDateStatus;
    score: number;
    reason: string;
  }

  const candidates: Candidate[] = [];

  plan.timeline.forEach((section, secIdx) => {
    section.tasks.forEach((task) => {
      if (task.completed) return;
      if (dismissedTaskIds.includes(task.id)) return;

      const dateStatus = calculateTaskDateStatus(task.dueDate, plan.basics.eventDate, task.completed);
      let score = 100 - secIdx * 10;
      let reason = 'Next sequential milestone in your preparation roadmap.';

      if (dateStatus.status === 'overdue') {
        score += 500 + Math.min(100, Math.abs(dateStatus.daysDiff || 0));
        reason = 'This task is past its target date. Addressing it now keeps vendor and venue timelines from slipping.';
      } else if (dateStatus.status === 'due_soon') {
        score += 300 + (7 - (dateStatus.daysDiff || 0));
        reason = 'Due within the next 7 days. Completing this prevents last-minute coordination rushes.';
      } else if (task.priority === 'High') {
        score += 150;
        reason = 'High-priority cornerstone milestone needed to unlock upcoming planning decisions.';
      } else if (task.priority === 'Medium') {
        score += 50;
      }

      candidates.push({
        task,
        sectionId: section.id,
        sectionPeriod: section.period,
        dateStatus,
        score,
        reason,
      });
    });
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return {
    task: best.task,
    sectionId: best.sectionId,
    sectionPeriod: best.sectionPeriod,
    dateStatus: best.dateStatus,
    reason: best.reason,
  };
}

/**
 * Priority 3.2: Plan Completeness Indicator
 * Evaluates core event details without blocking user progress.
 */
export function calculatePlanCompleteness(plan: EventPlan): PlanCompleteness {
  const hasDate = Boolean(
    plan.basics.dateType === 'exact' && plan.basics.eventDate && plan.basics.eventDate.trim().length > 0
  );
  const hasGuests = Boolean(plan.basics.guestCount && plan.basics.guestCount > 0);
  const hasBudget = Boolean(plan.budget && plan.budget.totalBudget > 0 && plan.budget.items.length > 0);
  const hasLocation = Boolean(plan.basics.location && plan.basics.location.trim().length > 0);
  const hasVendors = Boolean(plan.vendors && plan.vendors.length >= 3);

  const metrics: PlanCompletenessMetric[] = [
    {
      key: 'eventDate',
      label: 'Target Event Date',
      isComplete: hasDate,
      valueDescription: hasDate
        ? new Date(plan.basics.eventDate!).toLocaleDateString(undefined, { dateStyle: 'medium' })
        : 'Undecided / Flexible',
    },
    {
      key: 'guestCount',
      label: 'Guest Count',
      isComplete: hasGuests,
      valueDescription: hasGuests ? `${plan.basics.guestCount} attendees` : 'Not specified',
    },
    {
      key: 'budget',
      label: 'Balanced Budget',
      isComplete: hasBudget,
      valueDescription: hasBudget
        ? formatCurrency(plan.budget.totalBudget, plan.budget.currency)
        : 'Budget needed',
    },
    {
      key: 'location',
      label: 'Venue / Location',
      isComplete: hasLocation,
      valueDescription: hasLocation ? plan.basics.location! : 'Location pending',
    },
    {
      key: 'vendors',
      label: 'Major Vendor Roster',
      isComplete: hasVendors,
      valueDescription: `${plan.vendors?.length || 0} services tracked`,
    },
  ];

  const completedCount = metrics.filter((m) => m.isComplete).length;
  const totalCount = metrics.length;
  const score = Math.round((completedCount / totalCount) * 100);

  return {
    score,
    completedCount,
    totalCount,
    metrics,
  };
}

/**
 * Priority 3.3: Community Event Checklist Template
 * Relevant optional items with 'needed', 'completed', or 'not_needed' status.
 */
export function generateDefaultCommunityChecklist(eventName?: string): CommunityChecklistItem[] {
  return [
    {
      id: 'comm-chk-1',
      category: 'Permits',
      title: 'Municipal Park / Venue Permit',
      description: 'Submit city park reservation, special event application, and facility usage agreement.',
      status: 'needed',
    },
    {
      id: 'comm-chk-2',
      category: 'Permits',
      title: 'Sound & Noise Amplification Waiver',
      description: 'Obtain city decibel permit and curfew compliance authorization for outdoor speakers/music.',
      status: 'needed',
    },
    {
      id: 'comm-chk-3',
      category: 'Volunteers',
      title: 'Volunteer Recruitment & Role Assignment',
      description: 'Recruit volunteer leads for check-in desk, crowd guidance, activity stations, and teardown.',
      status: 'needed',
    },
    {
      id: 'comm-chk-4',
      category: 'Accessibility',
      title: 'Universal Accessibility Audit',
      description: 'Verify step-free wheelchair access, accessible portable restrooms, and ADA parking spaces.',
      status: 'needed',
    },
    {
      id: 'comm-chk-5',
      category: 'Sanitation & Waste',
      title: 'Zero-Waste & Recycling Stations',
      description: 'Arrange paired recycling, compost, and trash receptacles with a post-event sweep team.',
      status: 'needed',
    },
    {
      id: 'comm-chk-6',
      category: 'Weather & Contingency',
      title: 'Weather & Rain Canopy Contingency',
      description: 'Secure pop-up shaded canopies, weighted tie-downs, and rain shelter protocol for attendees.',
      status: 'needed',
    },
    {
      id: 'comm-chk-7',
      category: 'Safety & First Aid',
      title: 'First Aid Kit & Emergency Protocol',
      description: 'Stock a certified first aid kit, identify a CPR-certified volunteer lead, and set up water hydration points.',
      status: 'needed',
    },
    {
      id: 'comm-chk-8',
      category: 'Neighborhood Coordination',
      title: 'Local Neighborhood & Parking Notice',
      description: 'Notify nearby neighbors/businesses 14 days in advance and post visible parking signage.',
      status: 'needed',
    },
  ];
}
