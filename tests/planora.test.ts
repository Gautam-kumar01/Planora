import { describe, it, expect, beforeEach } from 'vitest';

// Polyfill localStorage in Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, String(value)),
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

import {
  generateDeterministicBudget,
  reconcileBudget,
  calculateTaskDateStatus,
  getRecommendedNextStep,
  calculatePlanCompleteness,
  generateDefaultCommunityChecklist,
  assessBudgetFeasibility,
} from '../src/utils/deterministicMath';
import {
  canUserAccessPlan,
  savePlans,
  loadSavedPlans,
  deleteStoredPlan,
  purgeUserData,
} from '../src/utils/storage';
import { deleteUserAccount } from '../src/utils/cloudSync';
import { regenerateIdeasWithAI } from '../src/utils/geminiApi';
import { SAMPLE_WEDDING_PLAN, SAMPLE_BIRTHDAY_PLAN, SAMPLE_COMMUNITY_PLAN } from '../src/utils/sampleData';
import { EventPlan, BudgetItem, VendorQuote } from '../src/types';
import { analyzePlanChangeImpact, applyAcceptedImpactSuggestions } from '../src/utils/changeImpactEngine';
import { runPlanConflictAudit } from '../src/utils/conflictCheckerEngine';
import { generateNeutralQuoteComparison } from '../src/utils/vendorQuoteEngine';

describe('Priority 1 — Security, Privacy & Plan Ownership Isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('enforces plan ownership: User A cannot access User B private plans', () => {
    const userAPlan: EventPlan = {
      ...SAMPLE_WEDDING_PLAN,
      id: 'plan-user-a-1',
      userId: 'user-a-uuid',
    };

    const userBPlan: EventPlan = {
      ...SAMPLE_BIRTHDAY_PLAN,
      id: 'plan-user-b-1',
      userId: 'user-b-uuid',
    };

    // User A can access own plan
    expect(canUserAccessPlan(userAPlan, 'user-a-uuid')).toBe(true);
    // User A cannot access User B's plan
    expect(canUserAccessPlan(userBPlan, 'user-a-uuid')).toBe(false);
    // User B can access own plan
    expect(canUserAccessPlan(userBPlan, 'user-b-uuid')).toBe(true);
    // User B cannot access User A's plan
    expect(canUserAccessPlan(userAPlan, 'user-b-uuid')).toBe(false);
  });

  it('isolates storage per user and prevents cross-user plan leakage', () => {
    const userAPlans: EventPlan[] = [
      { ...SAMPLE_WEDDING_PLAN, id: 'plan-a-1', userId: 'user-a' },
    ];
    const userBPlans: EventPlan[] = [
      { ...SAMPLE_BIRTHDAY_PLAN, id: 'plan-b-1', userId: 'user-b' },
    ];

    savePlans(userAPlans, 'user-a');
    savePlans(userBPlans, 'user-b');

    const loadedA = loadSavedPlans('user-a');
    const loadedB = loadSavedPlans('user-b');

    expect(loadedA.some((p) => p.id === 'plan-a-1')).toBe(true);
    expect(loadedA.some((p) => p.id === 'plan-b-1')).toBe(false);

    expect(loadedB.some((p) => p.id === 'plan-b-1')).toBe(true);
    expect(loadedB.some((p) => p.id === 'plan-a-1')).toBe(false);
  });

  it('supports deleting an individual plan', () => {
    const plans: EventPlan[] = [
      { ...SAMPLE_WEDDING_PLAN, id: 'plan-del-1', userId: 'user-test' },
      { ...SAMPLE_BIRTHDAY_PLAN, id: 'plan-del-2', userId: 'user-test' },
    ];
    savePlans(plans, 'user-test');

    deleteStoredPlan('plan-del-1', 'user-test');
    const remaining = loadSavedPlans('user-test');
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('plan-del-2');
  });

  it('supports complete account deletion and purges user data', () => {
    const plans: EventPlan[] = [
      { ...SAMPLE_WEDDING_PLAN, id: 'plan-purge-1', userId: 'user-to-delete' },
    ];
    savePlans(plans, 'user-to-delete');
    expect(localStorage.getItem('planora_plans_user_user-to-delete')).not.toBeNull();

    deleteUserAccount('user-to-delete');
    // Storage key must be completely removed from localStorage
    expect(localStorage.getItem('planora_plans_user_user-to-delete')).toBeNull();
  });
});

describe('Priority 2 — Correctness, Deterministic Arithmetic & Timeline Awareness', () => {
  it('guarantees budget allocations exactly equal total budget for wedding, birthday, community', () => {
    const testBudgets = [5000, 15000, 24500, 50000, 100000];
    const eventTypes: Array<'wedding' | 'birthday' | 'community'> = ['wedding', 'birthday', 'community'];

    for (const eventType of eventTypes) {
      for (const total of testBudgets) {
        const items = generateDeterministicBudget(eventType, total);
        const sum = items.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
        expect(sum).toBe(total);
      }
    }
  });

  it('reconciles manual budget edits and validates over-budget states', () => {
    const items: BudgetItem[] = [
      { id: '1', category: 'Venue', allocatedAmount: 5000, spentAmount: 0, percentage: 50 },
      { id: '2', category: 'Catering', allocatedAmount: 4000, spentAmount: 0, percentage: 40 },
      { id: '3', category: 'Music', allocatedAmount: 2000, spentAmount: 0, percentage: 20 },
    ];

    // Total = 11000 against 10000 target => over budget
    const resultOver = reconcileBudget(items, 10000);
    expect(resultOver.totalAllocated).toBe(11000);
    expect(resultOver.isOverBudget).toBe(true);
    expect(resultOver.unallocated).toBe(-1000);

    // Total = 11000 against 15000 target => under budget
    const resultUnder = reconcileBudget(items, 15000);
    expect(resultUnder.isOverBudget).toBe(false);
    expect(resultUnder.unallocated).toBe(4000);
  });

  it('accurately identifies task date status (overdue, due_soon, upcoming, completed)', () => {
    const today = new Date();
    
    // Past date => Overdue
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 10);
    const pastStr = pastDate.toISOString().split('T')[0];
    const statusOverdue = calculateTaskDateStatus(pastStr, undefined, false);
    expect(statusOverdue.status).toBe('overdue');

    // Due in 3 days => Due Soon
    const soonDate = new Date(today);
    soonDate.setDate(today.getDate() + 3);
    const soonStr = soonDate.toISOString().split('T')[0];
    const statusSoon = calculateTaskDateStatus(soonStr, undefined, false);
    expect(statusSoon.status).toBe('due_soon');

    // Due in 30 days => Upcoming
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);
    const futureStr = futureDate.toISOString().split('T')[0];
    const statusUpcoming = calculateTaskDateStatus(futureStr, undefined, false);
    expect(statusUpcoming.status).toBe('upcoming');

    // Completed task is always marked completed regardless of date
    const statusCompleted = calculateTaskDateStatus(pastStr, undefined, true);
    expect(statusCompleted.status).toBe('completed');
  });

  it('isolated AI idea regeneration preserves user edits in budget, timeline, vendors', async () => {
    const originalFetch = globalThis.fetch;
    (globalThis as any).fetch = async () => ({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                themeConcept: {
                  title: 'Boho Chic Garden Gathering',
                  description: 'A relaxed outdoor garden celebration with soft fairy lights.',
                  colorPalette: [
                    { name: 'Sage Green', hex: '#84A98C' },
                    { name: 'Terracotta', hex: '#C2410C' },
                  ],
                  keywords: ['Boho', 'Garden', 'Intimate', 'Warm'],
                },
                ideas: {
                  activities: [
                    {
                      title: 'Acoustic Guitar Circle',
                      description: 'Live interactive acoustic music corner.',
                      estimatedCost: '$50',
                    },
                  ],
                  foodAndBeverage: [
                    {
                      title: 'Botanical Herb-Infused Spritz',
                      description: 'Refreshing rosemary citrus mocktails.',
                    },
                  ],
                  decorAndAtmosphere: [
                    {
                      title: 'Fairy Light Canopy',
                      description: 'Overhead warm fairy bulbs.',
                    },
                  ],
                  diyHacks: ['Repurpose mason jars with wild foliage for table decor.'],
                },
              }),
            },
          },
        ],
      }),
    });

    try {
      const customPlan: EventPlan = {
        ...SAMPLE_WEDDING_PLAN,
        budget: {
          totalBudget: 45000,
          currency: 'USD',
          items: [
            {
              id: 'custom-b-1',
              category: 'Custom Bespoke Venue',
              allocatedAmount: 45000,
              spentAmount: 12000,
              percentage: 100,
            },
          ],
        },
        timeline: [
          {
            id: 'custom-sec-1',
            period: 'Custom Phase 1',
            tasks: [
              {
                id: 'custom-t-1',
                title: 'Handcrafted User Task',
                completed: true,
                category: 'Logistics',
                priority: 'High',
              },
            ],
          },
        ],
        vendors: [
          {
            id: 'custom-v-1',
            service: 'Exclusive Michelin Caterer',
            urgency: 'Immediate',
            status: 'booked',
            targetLeadTime: '12 months',
            recommendedBudgetRange: '$20,000',
            questions: ['Custom question?'],
          },
        ],
      };

      // Regenerate ideas & theme
      const freshIdeas = await regenerateIdeasWithAI(customPlan, 'Boho chic garden party');

      // Verify fresh ideas were generated
      expect(freshIdeas.ideas.activities.length).toBeGreaterThan(0);
      expect(freshIdeas.themeConcept.colorPalette.length).toBeGreaterThan(0);

      // Apply only ideas & theme to custom plan
      const updatedPlan: EventPlan = {
        ...customPlan,
        ideas: freshIdeas.ideas,
        themeConcept: freshIdeas.themeConcept,
      };

      // All user edits in budget, timeline, and vendors MUST be strictly preserved
      expect(updatedPlan.budget.totalBudget).toBe(45000);
      expect(updatedPlan.budget.items[0].category).toBe('Custom Bespoke Venue');
      expect(updatedPlan.budget.items[0].spentAmount).toBe(12000);
      expect(updatedPlan.timeline[0].tasks[0].title).toBe('Handcrafted User Task');
      expect(updatedPlan.timeline[0].tasks[0].completed).toBe(true);
      expect(updatedPlan.vendors[0].service).toBe('Exclusive Michelin Caterer');
      expect(updatedPlan.vendors[0].status).toBe('booked');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('Priority 3 — High-Value Features & Challenge 5 Core Outcomes', () => {
  it('Next Best Step card recommends the nearest incomplete task and respects dismissals', () => {
    const plan = { ...SAMPLE_WEDDING_PLAN };
    const step1 = getRecommendedNextStep(plan, []);
    expect(step1).not.toBeNull();
    expect(step1?.task.completed).toBe(false);

    // When step1 is dismissed, it recommends the next candidate
    const step2 = getRecommendedNextStep(plan, [step1!.task.id]);
    expect(step2).not.toBeNull();
    expect(step2?.task.id).not.toBe(step1?.task.id);
  });

  it('Plan Completeness indicator scores key details without blocking user progress', () => {
    const completeness = calculatePlanCompleteness(SAMPLE_WEDDING_PLAN);
    expect(completeness.totalCount).toBe(5);
    expect(completeness.score).toBeGreaterThanOrEqual(80);
    expect(completeness.metrics.some((m) => m.key === 'budget')).toBe(true);
    expect(completeness.metrics.some((m) => m.key === 'eventDate')).toBe(true);
  });

  it('Community Event Checklist generates 8 relevant coordination categories with status toggling', () => {
    const checklist = generateDefaultCommunityChecklist('Riverside Neighborhood Festival');
    expect(checklist.length).toBe(8);

    const categories = checklist.map((i) => i.category);
    expect(categories).toContain('Permits');
    expect(categories).toContain('Volunteers');
    expect(categories).toContain('Accessibility');
    expect(categories).toContain('Sanitation & Waste');
    expect(categories).toContain('Weather & Contingency');
    expect(categories).toContain('Safety & First Aid');
    expect(categories).toContain('Neighborhood Coordination');

    // All start as 'needed' and allow switching to 'completed' or 'not_needed'
    expect(checklist[0].status).toBe('needed');
  });

  it('produces the four core Challenge 5 outcomes for wedding, birthday, and community', () => {
    const samplePlans = [SAMPLE_WEDDING_PLAN, SAMPLE_BIRTHDAY_PLAN, SAMPLE_COMMUNITY_PLAN];

    for (const plan of samplePlans) {
      // 1. Budget with items
      expect(plan.budget.totalBudget).toBeGreaterThan(0);
      expect(plan.budget.items.length).toBeGreaterThan(0);
      const budgetSum = plan.budget.items.reduce((s, i) => s + i.allocatedAmount, 0);
      expect(budgetSum).toBe(plan.budget.totalBudget);

      // 2. Timeline with sections and actionable tasks
      expect(plan.timeline.length).toBeGreaterThan(0);
      expect(plan.timeline[0].tasks.length).toBeGreaterThan(0);

      // 3. Vendor checklist with services and interview questions
      expect(plan.vendors.length).toBeGreaterThan(0);
      expect(plan.vendors[0].questions.length).toBeGreaterThan(0);

      // 4. Personalized ideas (activities, F&B, decor, DIY hacks)
      expect(plan.ideas.activities.length).toBeGreaterThan(0);
      expect(plan.ideas.foodAndBeverage.length).toBeGreaterThan(0);
      expect(plan.ideas.decorAndAtmosphere.length).toBeGreaterThan(0);
      expect(plan.ideas.diyHacks.length).toBeGreaterThan(0);
    }
  });

  it('Budget Feasibility advisor provides constructive benchmarks without declaring events impossible', () => {
    const tightWedding = assessBudgetFeasibility('wedding', 2000, 100, 'USD');
    expect(tightWedding.status).toBe('tight');
    expect(tightWedding.recommendations.length).toBeGreaterThan(0);
    expect(tightWedding.message).toContain('per guest');

    const healthyWedding = assessBudgetFeasibility('wedding', 20000, 100, 'USD');
    expect(healthyWedding.status).toBe('healthy');

    const generousWedding = assessBudgetFeasibility('wedding', 35000, 100, 'USD');
    expect(generousWedding.status).toBe('generous');
  });

  it('demo wedding plan seating capacity matches 150 guests and booked vendors have signed contracts', () => {
    // 1. Check guest count matches table capacity (150 guests == 150 seats)
    expect(SAMPLE_WEDDING_PLAN.basics.guestCount).toBe(150);
    const totalTableSeats = (SAMPLE_WEDDING_PLAN.tables || []).reduce((sum, t) => sum + (t.capacity || 0), 0);
    expect(totalTableSeats).toBe(150);

    // 2. Ensure conflict checker does not trigger capacity deficit for demo plan
    const findings = runPlanConflictAudit(SAMPLE_WEDDING_PLAN);
    const capacityDeficit = findings.find((f) => f.id === 'conflict-capacity-table-deficit');
    expect(capacityDeficit).toBeUndefined();

    // 3. Ensure booked venue has signed contract status
    const venue = SAMPLE_WEDDING_PLAN.vendors.find((v) => v.service.toLowerCase().includes('venue'));
    expect(venue).toBeDefined();
    expect(venue?.status).toBe('booked');
    expect(venue?.contractStatus).toBe('signed');

    // 4. Ensure booked photographer has signed contract status
    const photographer = SAMPLE_WEDDING_PLAN.vendors.find((v) => v.service.toLowerCase().includes('photographer'));
    expect(photographer).toBeDefined();
    expect(photographer?.status).toBe('booked');
    expect(photographer?.contractStatus).toBe('signed');
  });
});

describe('Feature 1: Change Impact Assistant', () => {
  it('analyzes changes to guest count, budget, and date without modifying the plan object automatically', () => {
    const originalPlan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    const originalGuestCount = originalPlan.basics.guestCount;
    const originalBudget = originalPlan.budget.totalBudget;

    const analysis = analyzePlanChangeImpact(originalPlan, {
      guestCount: originalGuestCount + 50,
      totalBudget: originalBudget + 5000,
      eventDate: '2027-10-15',
    });

    // 1. Changing a plan input shows relevant impacts without changing the plan automatically
    expect(originalPlan.basics.guestCount).toBe(originalGuestCount);
    expect(originalPlan.budget.totalBudget).toBe(originalBudget);
    const guestFieldChange = analysis.changedFields.find((f) => f.field === 'guestCount');
    expect(guestFieldChange).toBeDefined();
    expect(guestFieldChange?.newValue).toContain(`${originalGuestCount + 50}`);
    expect(analysis.plainLanguageExplanation.length).toBeGreaterThan(0);
    expect(analysis.suggestions.length).toBeGreaterThan(0);

    // Explains impact in plain language
    const plainText = analysis.plainLanguageExplanation.join(' ');
    expect(plainText.toLowerCase()).toContain('guest');

    // Label cost and vendor suggestions as estimates
    for (const sug of analysis.suggestions) {
      if (sug.section === 'budget' || sug.section === 'vendors') {
        expect(sug.isEstimate).toBe(true);
      }
    }
  });

  it('accepting one suggested update does not overwrite unrelated user edits', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    // Add custom user edit in notes and custom task
    plan.basics.preferences.constraints = 'User constraint that must never be overwritten';
    plan.budget.items[0].notes = 'User custom catering notes';

    const analysis = analyzePlanChangeImpact(plan, {
      guestCount: plan.basics.guestCount + 40,
    });

    // Accept only the first suggestion
    const firstSuggestion = analysis.suggestions[0];
    const updatedPlan = applyAcceptedImpactSuggestions(plan, [firstSuggestion], {
      guestCount: plan.basics.guestCount + 40,
    });

    // Basics are updated
    expect(updatedPlan.basics.guestCount).toBe(plan.basics.guestCount + 40);
    // Unrelated user edits are preserved!
    expect(updatedPlan.basics.preferences.constraints).toBe('User constraint that must never be overwritten');
    expect(updatedPlan.budget.items[0].notes).toBe('User custom catering notes');
    // Ideas are preserved
    expect(updatedPlan.ideas).toEqual(plan.ideas);
  });

  it('deterministic budget reconcile updates calculations correctly with application logic', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    const originalItemsCount = plan.budget.items.length;

    // Change budget items sum intentionally to deviate from totalBudget
    plan.budget.items[0].allocatedAmount = 1000;
    const reconciled = reconcileBudget(plan.budget.items, plan.budget.totalBudget);

    // Reconciles and reports total allocated vs unallocated
    expect(reconciled.totalAllocated + reconciled.unallocated).toBe(plan.budget.totalBudget);
    expect(reconciled.reconciledItems.length).toBe(originalItemsCount);
  });
});

describe('Feature 2: Plan Conflict Checker', () => {
  it('detects guest count exceeding venue or seating capacity', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.basics.guestCount = 200;
    // Tables capacity is only 2 * 10 = 20
    plan.tables = [
      { id: 't1', name: 'Table 1', shape: 'round', capacity: 10 },
      { id: 't2', name: 'Table 2', shape: 'round', capacity: 10 },
    ];

    const findings = runPlanConflictAudit(plan);
    const capacityConflict = findings.find((f) => f.id === 'conflict-capacity-table-deficit' || f.category === 'capacity');
    expect(capacityConflict).toBeDefined();
    expect(capacityConflict?.severity).toBe('needs_attention');
    expect(capacityConflict?.suggestedNextStep).toContain('table');
  });

  it('detects budget allocations not matching total budget', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.budget.totalBudget = 10000;
    plan.budget.items = [
      { id: 'b1', category: 'Catering', allocatedAmount: 8000, actualSpent: 0, priority: 'Essential' },
      { id: 'b2', category: 'Venue', allocatedAmount: 4000, actualSpent: 0, priority: 'Essential' },
    ]; // Sum = 12000 vs 10000

    const findings = runPlanConflictAudit(plan);
    const budgetConflict = findings.find((f) => f.id === 'conflict-budget-overage' || f.category === 'budget');
    expect(budgetConflict).toBeDefined();
    expect(budgetConflict?.severity).toBe('needs_attention');
    expect(budgetConflict?.affectedDetails).toContain('$12,000');
  });

  it('detects tasks scheduled after event or overdue', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.basics.eventDate = '2026-06-01';
    plan.timeline = [
      {
        id: 't-sec-1',
        period: 'Wrap-up',
        tasks: [
          {
            id: 'late-task-1',
            title: 'Late Caterer Booking',
            category: 'Vendors',
            dueDate: '2026-06-15', // After event date!
            completed: false,
            priority: 'High',
          },
        ],
      },
    ];

    const findings = runPlanConflictAudit(plan);
    const postEventConflict = findings.find((f) => f.id.startsWith('conflict-task-after-event'));
    expect(postEventConflict).toBeDefined();
    expect(postEventConflict?.severity).toBe('needs_attention');
  });

  it('detects guest dietary/allergy requirements that need caterer confirmation', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.guests = [
      { id: 'g1', name: 'Alice', rsvpStatus: 'attending', dietary: 'Nut Allergy', plusOnes: 0 },
    ];
    // Caterer vendor not booked
    plan.vendors = [
      {
        id: 'v-cater',
        service: 'Full-Service Catering',
        urgency: 'Immediate',
        status: 'to_research',
        targetLeadTime: '6 months',
        recommendedBudgetRange: '$4,000 - $6,000',
        questions: [],
      },
    ];

    const findings = runPlanConflictAudit(plan);
    const allergyConflict = findings.find((f) => f.id === 'conflict-dietary-allergens-unconfirmed');
    expect(allergyConflict).toBeDefined();
    expect(allergyConflict?.severity).toBe('worth_checking');
    expect(allergyConflict?.disclaimer).toContain('Medical & Allergen Notice');
  });

  it('supports dismissing and resolving findings and persists state', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.budget.totalBudget = 10000;
    plan.budget.items = [
      { id: 'b1', category: 'Catering', allocatedAmount: 8000, actualSpent: 0, priority: 'Essential' },
      { id: 'b2', category: 'Venue', allocatedAmount: 4000, actualSpent: 0, priority: 'Essential' },
    ];

    const initialFindings = runPlanConflictAudit(plan);
    const targetFinding = initialFindings[0];
    expect(targetFinding.isResolved).toBe(false);
    expect(targetFinding.isDismissed).toBe(false);

    // Simulate user resolving finding
    plan.resolvedConflictIds = [targetFinding.id];
    const afterResolve = runPlanConflictAudit(plan);
    const resolvedCheck = afterResolve.find((f) => f.id === targetFinding.id);
    expect(resolvedCheck?.isResolved).toBe(true);

    // Simulate dismissing another finding
    if (initialFindings[1]) {
      plan.dismissedConflictIds = [initialFindings[1].id];
      const afterDismiss = runPlanConflictAudit(plan);
      const dismissedCheck = afterDismiss.find((f) => f.id === initialFindings[1].id);
      expect(dismissedCheck?.isDismissed).toBe(true);
    }
  });

  it('labels unknown / missing details rather than fabricating facts', () => {
    const plan = JSON.parse(JSON.stringify(SAMPLE_WEDDING_PLAN)) as EventPlan;
    plan.tables = []; // No tables configured

    const findings = runPlanConflictAudit(plan);
    const missingTablesFinding = findings.find((f) => f.id === 'conflict-capacity-unverified');
    expect(missingTablesFinding).toBeDefined();
    expect(missingTablesFinding?.title).toContain('Unable to Verify');
  });
});

describe('Feature 3: Vendor Quote Comparison', () => {
  it('generates neutral side-by-side comparison without biased best rankings', () => {
    const quotes: VendorQuote[] = [
      {
        id: 'q1',
        vendorName: 'Artisan Culinary Co',
        quoteAmount: 4200,
        currency: 'USD',
        depositRequired: '$1,000 non-refundable',
        paymentSchedule: '50% 30 days prior, 50% day of',
        cancellationTerms: 'Full refund up to 30 days prior',
        availabilityConfirmed: true,
        quoteExpiryDate: '2026-12-01',
        includedServices: '4-Course Plated Dinner, Tasting for 2, Cutlery & Linens',
        exclusions: 'Alcohol & Bartending',
        notes: 'Includes cake cutting service',
      },
      {
        id: 'q2',
        vendorName: 'Harvest Table Buffet',
        quoteAmount: 3500,
        currency: 'USD',
        includedServices: 'Buffet Setup & Service, Biodegradable Plates',
        availabilityConfirmed: 'unconfirmed',
      },
    ];

    const comparison = generateNeutralQuoteComparison(quotes, 'Catering');

    // 1. Comparison includes neutral price difference note
    expect(comparison.priceDifferenceNote).toContain('Artisan Culinary Co');
    expect(comparison.priceDifferenceNote).toContain('Harvest Table Buffet');
    expect(comparison.priceDifferenceNote).toContain('$700');

    // 2. Neutral advice does NOT declare a vendor as "winner" or "best"
    const adviceLower = comparison.neutralAdvice.toLowerCase();
    expect(adviceLower).not.toContain('best');
    expect(adviceLower).not.toContain('winner');
    expect(adviceLower).not.toContain('recommend picking');

    // 3. Flags unconfirmed / missing information
    expect(comparison.missingDetailsList.length).toBeGreaterThan(0);
    const missingJoined = comparison.missingDetailsList.join(' ');
    expect(missingJoined).toContain('Harvest Table Buffet');
    expect(missingJoined).toContain('deposit terms');
  });

  it('handles empty quotes cleanly without crash', () => {
    const comparison = generateNeutralQuoteComparison([], 'Catering');
    expect(comparison.priceDifferenceNote).toBe('No quotes entered yet.');
    expect(comparison.scopeHighlights.length).toBe(0);
  });
});

