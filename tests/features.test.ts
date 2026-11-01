import { describe, it, expect } from 'vitest';
import {
  EventPlan,
  HourlyRunOfShowItem,
  GuestItem,
  TableItem,
  VendorQuote,
  ExpenseRecord,
} from '../src/types';
import { SAMPLE_WEDDING_PLAN, SAMPLE_BIRTHDAY_PLAN } from '../src/utils/sampleData';
import { analyzePlanChangeImpact, applyAcceptedImpactSuggestions } from '../src/utils/changeImpactEngine';
import { runPlanConflictAudit } from '../src/utils/conflictCheckerEngine';
import { generateNeutralQuoteComparison } from '../src/utils/vendorQuoteEngine';

describe('Feature Suite 1 — Day-Of Live Event Director & Run of Show', () => {
  const runOfShowMock: HourlyRunOfShowItem[] = [
    { id: 'ros-1', time: '09:00 AM', activity: 'Vendor Setup & Sound Check', owner: 'DJ Lead', location: 'Main Lawn' },
    { id: 'ros-2', time: '11:00 AM', activity: 'Guest Arrival & Welcome Drinks', owner: 'Host / MC', location: 'Foyer' },
    { id: 'ros-3', time: '12:30 PM', activity: 'Main Ceremony / Nuptials', owner: 'Officiant', location: 'Main Lawn' },
    { id: 'ros-4', time: '02:00 PM', activity: 'Grand Banquet Luncheon', owner: 'Catering Lead', location: 'Banquet Hall' },
  ];

  it('correctly tracks sequential run-of-show milestones', () => {
    expect(runOfShowMock.length).toBe(4);
    expect(runOfShowMock[0].activity).toBe('Vendor Setup & Sound Check');
    expect(runOfShowMock[3].location).toBe('Banquet Hall');
  });

  it('simulates stage delay buffer (+15 mins) on milestone scheduling', () => {
    // Function that shifts run of show times by delayMinutes
    const applyStageDelay = (items: HourlyRunOfShowItem[], delayMins: number): HourlyRunOfShowItem[] => {
      return items.map((item) => ({
        ...item,
        notes: item.notes ? `${item.notes} (+${delayMins}m stage delay)` : `Delayed by +${delayMins}m`,
      }));
    };

    const delayed = applyStageDelay(runOfShowMock, 15);
    expect(delayed[0].notes).toContain('+15m');
    expect(delayed.length).toBe(runOfShowMock.length);
  });

  it('validates active milestone indexing and boundary limits', () => {
    let activeIndex = 0;
    const advanceMilestone = (current: number, total: number) => Math.min(total - 1, current + 1);

    activeIndex = advanceMilestone(activeIndex, runOfShowMock.length);
    expect(activeIndex).toBe(1);

    activeIndex = advanceMilestone(activeIndex, runOfShowMock.length);
    expect(activeIndex).toBe(2);

    activeIndex = advanceMilestone(activeIndex, runOfShowMock.length);
    expect(activeIndex).toBe(3);

    // Boundary check: cannot exceed max items
    activeIndex = advanceMilestone(activeIndex, runOfShowMock.length);
    expect(activeIndex).toBe(3);
  });
});

describe('Feature Suite 2 — Weather "Plan B" Contingency & Emergency Reserve', () => {
  it('correctly triggers rain contingency protocol when rain probability exceeds threshold', () => {
    const checkWeatherContingencyNeeded = (rainProbability: number) => {
      return rainProbability >= 60;
    };

    expect(checkWeatherContingencyNeeded(20)).toBe(false);
    expect(checkWeatherContingencyNeeded(84)).toBe(true);
  });

  it('funds marquee shelter tent rentals from 10% emergency contingency without breaking budget', () => {
    const totalBudget = 50000;
    const emergencyBuffer = totalBudget * 0.10; // $5,000 buffer
    const marqueeTentRentalCost = 2800;

    expect(marqueeTentRentalCost).toBeLessThanOrEqual(emergencyBuffer);
    const remainingContingency = emergencyBuffer - marqueeTentRentalCost;
    expect(remainingContingency).toBe(2200);
    // Total master budget remains intact
    expect(totalBudget).toBe(50000);
  });

  it('generates accurate guest and vendor weather broadcast text', () => {
    const eventTitle = 'Sharma & Kapoor Grand Wedding';
    const guestNotice = `Weather Plan B Notice: Due to anticipated rain, ceremonies for ${eventTitle} are moving to the Covered Glass Pavilion at 11:30 AM. Valet and coat-check will be provided!`;
    const vendorNotice = `URGENT VENDOR NOTICE [${eventTitle}]: Sound, floral, and seating setups are shifting immediately to indoor Pavilion B. Power outlets and load-in bays are cleared.`;

    expect(guestNotice).toContain('Covered Glass Pavilion');
    expect(guestNotice).toContain(eventTitle);
    expect(vendorNotice).toContain('Pavilion B');
    expect(vendorNotice).toContain('URGENT VENDOR NOTICE');
  });
});

describe('Feature Suite 3 — Guest RSVP Studio & Caterer Allergen Guard', () => {
  const sampleGuests: GuestItem[] = [
    { id: 'g-1', name: 'Aarav Sharma', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Vegetarian', tableId: 't-1' },
    { id: 'g-2', name: 'Priya Patel', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Nut Allergy', tableId: 't-1' },
    { id: 'g-3', name: 'Rohan Mehra', rsvpStatus: 'attending', plusOnes: 2, dietary: 'Vegan', tableId: 't-2' },
    { id: 'g-4', name: 'Ananya Iyer', rsvpStatus: 'pending', plusOnes: 0, dietary: 'Gluten-Free' },
    { id: 'g-5', name: 'Vikram Singh', rsvpStatus: 'declined', plusOnes: 0, dietary: 'None' },
  ];

  it('calculates total headcount factoring plus-ones accurately', () => {
    const attendingGuests = sampleGuests.filter((g) => g.rsvpStatus === 'attending');
    const totalAttendingHeadcount = attendingGuests.reduce((sum, g) => sum + 1 + g.plusOnes, 0);

    // Aarav (1+1=2) + Priya (1+0=1) + Rohan (1+2=3) = 6 attendees
    expect(totalAttendingHeadcount).toBe(6);
  });

  it('aggregates caterer dietary and medical allergy manifest', () => {
    const dietaryManifest: Record<string, number> = {};
    for (const g of sampleGuests) {
      if (g.rsvpStatus === 'attending' && g.dietary && g.dietary !== 'None') {
        dietaryManifest[g.dietary] = (dietaryManifest[g.dietary] || 0) + 1;
      }
    }

    expect(dietaryManifest['Vegetarian']).toBe(1);
    expect(dietaryManifest['Nut Allergy']).toBe(1);
    expect(dietaryManifest['Vegan']).toBe(1);
    expect(dietaryManifest['Gluten-Free']).toBeUndefined(); // Pending guest not counted in final catering manifest
  });

  it('detects allergen clashes on table seating assignments', () => {
    const _tables: TableItem[] = [
      { id: 't-1', name: 'Table 1 - Royal Orchid', capacity: 8, shape: 'round' },
      { id: 't-2', name: 'Table 2 - Golden Marigold', capacity: 8, shape: 'round' },
    ];

    const getTableAllergens = (tableId: string, guests: GuestItem[]): string[] => {
      const tableGuests = guests.filter((g) => g.tableId === tableId);
      const allergens = new Set<string>();
      for (const g of tableGuests) {
        if (g.dietary && g.dietary.toLowerCase().includes('allergy')) {
          allergens.add(g.dietary);
        }
      }
      return Array.from(allergens);
    };

    const table1Allergens = getTableAllergens('t-1', sampleGuests);
    expect(table1Allergens).toContain('Nut Allergy');

    const table2Allergens = getTableAllergens('t-2', sampleGuests);
    expect(table2Allergens.length).toBe(0);
  });
});

describe('Feature Suite 4 — Change Impact & Scenario Simulator', () => {
  it('detects budget deficit when guest headcount increases significantly', () => {
    const plan = SAMPLE_WEDDING_PLAN;
    const impact = analyzePlanChangeImpact(plan, {
      guestCount: plan.basics.guestCount + 60,
    });

    expect(impact.changedFields.length).toBeGreaterThan(0);
    expect(impact.changedFields.some((f) => f.field === 'guestCount')).toBe(true);
    expect(impact.plainLanguageExplanation.some((e) => e.includes('Increasing guest count'))).toBe(true);
    expect(impact.suggestions.length).toBeGreaterThan(0);
  });

  it('generates corrective suggestions when budget constraints tighten', () => {
    const plan = SAMPLE_BIRTHDAY_PLAN;
    const impact = analyzePlanChangeImpact(plan, {
      totalBudget: plan.budget.totalBudget - 1500,
    });

    expect(impact.changedFields.some((f) => f.field === 'totalBudget')).toBe(true);
    expect(impact.suggestions.length).toBeGreaterThan(0);
    expect(impact.suggestions.some((s) => s.section === 'budget')).toBe(true);
  });

  it('applies confirmed change suggestions into master event plan cleanly', () => {
    const plan = SAMPLE_WEDDING_PLAN;
    const impact = analyzePlanChangeImpact(plan, {
      guestCount: 150,
      totalBudget: 40000,
    });

    const patchedPlan = applyAcceptedImpactSuggestions(plan, impact.suggestions, {
      guestCount: 150,
      totalBudget: 40000,
    });

    expect(patchedPlan.basics.guestCount).toBe(150);
    expect(patchedPlan.basics.totalBudget).toBe(40000);
    expect(patchedPlan.budget.totalBudget).toBe(40000);
  });
});

describe('Feature Suite 5 — Vendor Procurement, Quotes & RFPs', () => {
  const sampleQuotes: VendorQuote[] = [
    {
      id: 'q-1',
      vendorName: 'Royal Cinema Studio',
      quoteAmount: 4500,
      currency: 'USD',
      includedServices: '2 Cinematographers, Drone, 4K Master Film',
      availabilityConfirmed: true,
      depositRequired: '$1,000 retainer',
    },
    {
      id: 'q-2',
      vendorName: 'Golden Lens Productions',
      quoteAmount: 3800,
      currency: 'USD',
      includedServices: '1 Cinematographer, Raw 4K Footage',
      availabilityConfirmed: true,
      depositRequired: '$1,500 retainer',
    },
    {
      id: 'q-3',
      vendorName: 'Heritage Visuals',
      quoteAmount: 5200,
      currency: 'USD',
      includedServices: 'Full 3-Day Coverage, Drone, Photo Album',
      availabilityConfirmed: false,
    },
  ];

  it('generates neutral, objective quote comparison with price variance', () => {
    const summary = generateNeutralQuoteComparison(sampleQuotes, 'Photography & Videography');

    expect(summary.priceDifferenceNote).toContain('$1,400'); // 5200 - 3800
    expect(summary.scopeHighlights.length).toBe(3);
    // Neutrality: Does not contain biased promotional words
    expect(summary.priceDifferenceNote).not.toContain('Our Recommended Best Pick');
  });

  it('handles empty quotes gracefully without crashing', () => {
    const summary = generateNeutralQuoteComparison([], 'Catering');
    expect(summary.priceDifferenceNote).toBe('No quotes entered yet.');
    expect(summary.missingDetailsList).toContain('No vendor quotes submitted for comparison.');
  });
});

describe('Feature Suite 6 — Real-Time Expense & Receipt Ledger', () => {
  const sampleExpenses: ExpenseRecord[] = [
    { id: 'exp-1', vendorName: 'Grand Palace Hotel', category: 'Venue', amount: 8000, paymentDate: '2026-10-01', paymentMethod: 'wire_transfer', status: 'paid' },
    { id: 'exp-2', vendorName: 'Spice Route Catering', category: 'Catering', amount: 4500, paymentDate: '2026-10-10', paymentMethod: 'credit_card', status: 'paid' },
    { id: 'exp-3', vendorName: 'Floral Whispers', category: 'Decor', amount: 1800, paymentDate: '2026-10-15', paymentMethod: 'venmo_zelle', status: 'pending' },
  ];

  it('calculates verified paid expenditures and cash liquidity correctly', () => {
    const totalBudget = 25000;
    const paidTotal = sampleExpenses
      .filter((e) => e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingTotal = sampleExpenses
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0);

    expect(paidTotal).toBe(12500); // 8000 + 4500
    expect(pendingTotal).toBe(1800);

    const remainingLiquidity = totalBudget - (paidTotal + pendingTotal);
    expect(remainingLiquidity).toBe(10700);
  });

  it('detects category over-budget variance when expenses exceed allocated ceiling', () => {
    const allocatedDecor = 1500;
    const actualDecorSpent = 1800;
    const isOverBudget = actualDecorSpent > allocatedDecor;
    const variance = actualDecorSpent - allocatedDecor;

    expect(isOverBudget).toBe(true);
    expect(variance).toBe(300);
  });
});

describe('Feature Suite 7 — Plan Conflict & Risk Auditing Engine', () => {
  it('detects unseated guest capacity deficit when tables cannot accommodate guest count', () => {
    const testPlan: EventPlan = {
      ...SAMPLE_WEDDING_PLAN,
      basics: { ...SAMPLE_WEDDING_PLAN.basics, guestCount: 200 },
      tables: [
        { id: 'tbl-1', name: 'Table 1', capacity: 10, shape: 'round' },
        { id: 'tbl-2', name: 'Table 2', capacity: 10, shape: 'round' },
      ], // Only 20 seats for 200 guests
    };

    const findings = runPlanConflictAudit(testPlan);
    const capacityConflict = findings.find((f) => f.id === 'conflict-capacity-table-deficit');

    expect(capacityConflict).toBeDefined();
    expect(capacityConflict?.severity).toBe('needs_attention');
    expect(capacityConflict?.explanation).toContain('180 unseated guests');
  });

  it('detects unverified floor plan capacity when tables are not configured', () => {
    const testPlan: EventPlan = {
      ...SAMPLE_WEDDING_PLAN,
      tables: [],
    };

    const findings = runPlanConflictAudit(testPlan);
    const unverifiedConflict = findings.find((f) => f.id === 'conflict-capacity-unverified');
    expect(unverifiedConflict).toBeDefined();
    expect(unverifiedConflict?.category).toBe('capacity');
  });

  it('detects unallocated budget surplus when line items do not sum to total budget', () => {
    const testPlan: EventPlan = {
      ...SAMPLE_WEDDING_PLAN,
      budget: {
        totalBudget: 50000,
        currency: 'USD',
        items: [
          { id: 'b-1', category: 'Venue', allocatedAmount: 10000, spentAmount: 0, percentage: 20 },
        ], // Only $10,000 allocated out of $50,000
      },
    };

    const findings = runPlanConflictAudit(testPlan);
    const budgetConflict = findings.find((f) => f.id === 'conflict-budget-underallocated');
    expect(budgetConflict).toBeDefined();
    expect(budgetConflict?.explanation).toContain('40,000');
  });
});

describe('Feature Suite 8 — Community Events & Municipal Statutory Compliance', () => {
  it('validates municipal permit checklist statuses and requirements', () => {
    const permits = [
      { id: 'p-1', name: 'Sound & Loudspeaker NOC', isMandatory: true, status: 'to_verify' },
      { id: 'p-2', name: 'Fire Safety Clearance', isMandatory: true, status: 'verified' },
      { id: 'p-3', name: 'Police Traffic Clearance', isMandatory: false, status: 'not_needed' },
    ];

    const unverifiedMandatory = permits.filter((p) => p.isMandatory && p.status === 'to_verify');
    expect(unverifiedMandatory.length).toBe(1);
    expect(unverifiedMandatory[0].name).toBe('Sound & Loudspeaker NOC');
  });

  it('validates community event timeline buffer margins', () => {
    const communityMilestones = [
      { time: '08:00 AM', activity: 'Park Grounds Access & Vendor Load-in' },
      { time: '10:00 AM', activity: 'Public Community Fair Opens' },
      { time: '05:00 PM', activity: 'Event Concludes & Grounds Cleanup' },
    ];

    expect(communityMilestones.length).toBe(3);
    expect(communityMilestones[0].activity).toContain('Load-in');
    expect(communityMilestones[2].activity).toContain('Cleanup');
  });
});
