import { describe, it, expect } from 'vitest';
import {
  formatIndianCurrency,
  calculateIndianCateringBreakdown,
  generateDefaultIndianFunctions,
  generateDefaultIndianPermits,
  generateDefaultIndianCatering,
  generateDefaultIndianBackups,
  initializeIndianEventConfig,
  HINDI_TERMS,
  createCustomIndianRitual,
  INDIAN_VENDOR_TEMPLATES,
  GENERAL_VENDOR_TEMPLATES,
  generateDefaultIndianVendors,
} from '../src/utils/indianEventEngine';
import {
  INDIAN_BUDGET_SPLITS,
  generateDeterministicBudget,
  formatCurrency,
} from '../src/utils/deterministicMath';
import { SAMPLE_WEDDING_PLAN } from '../src/utils/sampleData';

describe('Priority Indian Event Intelligence — Deterministic Indian Budget Allocations', () => {
  it('strictly sums category splits to 100% for Indian Weddings', () => {
    const weddingSplits = INDIAN_BUDGET_SPLITS.wedding;
    const totalSplit = weddingSplits.reduce((acc, curr) => acc + curr.percentage, 0);
    expect(totalSplit).toBe(100);

    // Verify key cultural categories exist
    const categories = weddingSplits.map((s) => s.category);
    expect(categories.some((c) => c.includes('Catering') || c.includes('Mithai'))).toBe(true);
    expect(categories.some((c) => c.includes('Mandap') || c.includes('Venue'))).toBe(true);
    expect(categories.some((c) => c.includes('Attire') || c.includes('Jewelry'))).toBe(true);
    expect(categories.some((c) => c.includes('Contingency'))).toBe(true);
  });

  it('strictly sums category splits to 100% for Indian Birthdays and Community Utsavs', () => {
    const birthdayTotal = INDIAN_BUDGET_SPLITS.birthday.reduce((acc, curr) => acc + curr.percentage, 0);
    expect(birthdayTotal).toBe(100);

    const communityTotal = INDIAN_BUDGET_SPLITS.community.reduce((acc, curr) => acc + curr.percentage, 0);
    expect(communityTotal).toBe(100);
  });

  it('generates zero-discrepancy deterministic INR budget allocations for ₹25 Lakhs', () => {
    const totalBudget = 2500000; // 25 Lakhs
    const items = generateDeterministicBudget('wedding', totalBudget, true);

    const allocatedSum = items.reduce((acc, curr) => acc + curr.allocatedAmount, 0);
    expect(allocatedSum).toBe(totalBudget);

    // Check emergency contingency reserve exists and is exactly 3% (₹75,000)
    const contingencyItem = items.find((i) => i.isContingency);
    expect(contingencyItem).toBeDefined();
    expect(contingencyItem?.allocatedAmount).toBe(75000);
  });

  it('correctly formats INR currency with Indian commas and compact Lakhs/Crores notation', () => {
    // Standard format (en-IN comma formatting)
    expect(formatIndianCurrency(2500000, false)).toBe('₹25,00,000');
    expect(formatIndianCurrency(50000, false)).toBe('₹50,000');
    expect(formatIndianCurrency(15000000, false)).toBe('₹1,50,00,000');

    // Compact format
    expect(formatIndianCurrency(2500000, true)).toBe('₹25 L');
    expect(formatIndianCurrency(15000000, true)).toBe('₹1.50 Cr');
    expect(formatIndianCurrency(50000, true)).toBe('₹50 k');

    // formatCurrency integration with 'INR'
    expect(formatCurrency(2500000, 'INR')).toBe('₹25,00,000');
  });
});

describe('Priority Indian Event Intelligence — Catering & 10% Unannounced Guest Buffer', () => {
  it('calculates the Indian +10% floating guest buffer for reliable food security', () => {
    const cateringConfig = generateDefaultIndianCatering('wedding', 200);
    cateringConfig.unannouncedBufferPercent = 10;

    const breakdown = calculateIndianCateringBreakdown(200, cateringConfig);

    expect(breakdown.guaranteedPlates).toBe(200);
    expect(breakdown.bufferPlates).toBe(20); // 10% of 200
    expect(breakdown.totalPreparedPlates).toBe(220); // 200 + 20
  });

  it('isolates Jain plates and enforces zero root-vegetables protocol', () => {
    const cateringConfig = generateDefaultIndianCatering('wedding', 300);
    cateringConfig.dietType = 'pure_veg';
    cateringConfig.jainGuestCount = 35; // 35 Jain guests

    const breakdown = calculateIndianCateringBreakdown(300, cateringConfig);

    expect(breakdown.guaranteedPlates).toBe(300);
    expect(breakdown.bufferPlates).toBe(30); // 10% buffer
    expect(breakdown.totalPreparedPlates).toBe(330);

    // Jain plates isolated
    expect(breakdown.jainPlates).toBe(35);
    // Remaining are pure vegetarian
    expect(breakdown.vegPlates).toBe(295); // 330 - 35
    expect(breakdown.nonVegPlates).toBe(0);
  });

  it('calculates live chaat, mithai, and paan counter costs', () => {
    const cateringConfig = generateDefaultIndianCatering('wedding', 100);
    cateringConfig.platePriceEstimate = 1200;
    cateringConfig.liveChaatCounters = true; // ₹85/plate
    cateringConfig.mithaiLiveCounters = true; // ₹95/plate
    cateringConfig.beveragePaanCounter = true; // ₹45/plate

    const breakdown = calculateIndianCateringBreakdown(100, cateringConfig);

    // 100 + 10% buffer = 110 plates
    expect(breakdown.totalPreparedPlates).toBe(110);
    expect(breakdown.baseFoodCost).toBe(110 * 1200); // ₹1,32,000
    expect(breakdown.liveStationsCost).toBe(110 * (85 + 95 + 45)); // ₹24,750
    expect(breakdown.totalCateringEstimate).toBe(110 * 1200 + 110 * 225);
  });
});

describe('Priority Indian Event Intelligence — Multi-Day Functions & Statutory Permits', () => {
  it('generates multi-day wedding sequence from Mehendi to Reception', () => {
    const functions = generateDefaultIndianFunctions('wedding', 250, '2027-11-20');
    expect(functions.length).toBeGreaterThanOrEqual(5);

    const types = functions.map((f) => f.type);
    expect(types).toContain('mehendi');
    expect(types).toContain('haldi');
    expect(types).toContain('sangeet');
    expect(types).toContain('wedding_pheras');
    expect(types).toContain('reception');

    // All functions should have Hindi ritual titles
    for (const fn of functions) {
      expect(fn.title.length).toBeGreaterThan(0);
      expect(fn.hindiTitle).toBeDefined();
      expect(fn.hindiTitle!.length).toBeGreaterThan(0);
    }
  });

  it('defaults statutory legal permits to "to_verify" status to enforce transparency', () => {
    const permits = generateDefaultIndianPermits('wedding');
    expect(permits.length).toBeGreaterThanOrEqual(4);

    const soundPermit = permits.find((p) => p.id === 'pm-sound-noc');
    expect(soundPermit).toBeDefined();
    expect(soundPermit?.status).toBe('to_verify');
    expect(soundPermit?.guidance).toContain('10:00 PM');

    const pplPermit = permits.find((p) => p.id === 'pm-ppl-iprs');
    expect(pplPermit).toBeDefined();
    expect(pplPermit?.status).toBe('to_verify');

    const outsideCatererRoyalty = permits.find((p) => p.id === 'pm-venue-outside-catering');
    expect(outsideCatererRoyalty).toBeDefined();
    expect(outsideCatererRoyalty?.status).toBe('to_verify');
  });

  it('generates dual silent DG set generator and waterproof pandal defaults', () => {
    const backups = generateDefaultIndianBackups();
    expect(backups.hasDualDGSet).toBe(true);
    expect(backups.pandalWaterproofing).toBe(true);
    expect(backups.elderlyWheelchairAccess).toBe(true);
    expect(backups.elderlyDiningProximity).toBe(true);
  });

  it('initializes full IndianEventConfig attached to SAMPLE_WEDDING_PLAN', () => {
    expect(SAMPLE_WEDDING_PLAN.indianIntelligence).toBeDefined();
    expect(SAMPLE_WEDDING_PLAN.indianIntelligence?.isEnabled).toBe(true);
    expect(SAMPLE_WEDDING_PLAN.indianIntelligence?.functions.length).toBeGreaterThan(0);
    expect(SAMPLE_WEDDING_PLAN.indianIntelligence?.permits.length).toBeGreaterThan(0);
    expect(SAMPLE_WEDDING_PLAN.indianIntelligence?.backups.hasDualDGSet).toBe(true);
  });

  it('contains comprehensive bilingual Hindi-English terms dictionary', () => {
    expect(HINDI_TERMS.roka).toContain('रोका');
    expect(HINDI_TERMS.mehendi).toContain('मेहंदी');
    expect(HINDI_TERMS.haldi).toContain('हल्दी');
    expect(HINDI_TERMS.pure_veg).toContain('शुद्ध शाकाहारी');
    expect(HINDI_TERMS.jain_veg).toContain('जैन');
    expect(HINDI_TERMS.dg_backup).toContain('साइलेंट डीजी');
    expect(HINDI_TERMS.cocktail).toContain('कॉकटेल');
    expect(HINDI_TERMS.baraat).toContain('बारात');
  });

  it('supports creating custom rituals with pre-filled cultural templates', () => {
    const cocktailRitual = createCustomIndianRitual('cocktail', '2027-06-20', 180);
    expect(cocktailRitual.type).toBe('cocktail');
    expect(cocktailRitual.title).toContain('Cocktail');
    expect(cocktailRitual.expectedGuests).toBe(Math.round(180 * 0.7)); // 70% guest ratio for cocktail
    expect(cocktailRitual.venueName).toBeDefined();

    const customRitual = createCustomIndianRitual('custom_ritual', '2027-06-20', 100);
    expect(customRitual.type).toBe('custom_ritual');
    expect(customRitual.id.startsWith('fn-custom_ritual-')).toBe(true);
  });

  it('provides culturally complete Indian vendor templates with 3 vetting questions each', () => {
    const templates = Object.values(INDIAN_VENDOR_TEMPLATES);
    expect(templates.length).toBe(8);

    const keys = Object.keys(INDIAN_VENDOR_TEMPLATES);
    expect(keys).toContain('mandap_decor');
    expect(keys).toContain('catering_halwai');
    expect(keys).toContain('photography');
    expect(keys).toContain('mehendi');
    expect(keys).toContain('dhol_dj');
    expect(keys).toContain('makeup_artist');
    expect(keys).toContain('pandit_ji');
    expect(keys).toContain('generator_backup');

    templates.forEach((tmpl) => {
      expect(tmpl.service.length).toBeGreaterThan(0);
      expect(tmpl.targetLeadTime.length).toBeGreaterThan(0);
      expect(tmpl.recommendedBudgetRange.length).toBeGreaterThan(0);
      expect(tmpl.questions.length).toBe(3);
      expect(['Immediate', 'Standard', 'Flexible']).toContain(tmpl.urgency);
    });
  });

  it('generates 8 structured default Indian vendors with to_research status', () => {
    const defaultVendors = generateDefaultIndianVendors(300, 3000000);
    expect(defaultVendors.length).toBe(8);
    expect(defaultVendors.every((v) => v.status === 'to_research')).toBe(true);
    expect(defaultVendors.every((v) => v.questions.length === 3)).toBe(true);
    expect(defaultVendors.some((v) => v.service.includes('Mandap'))).toBe(true);
    expect(defaultVendors.some((v) => v.service.includes('Halwai') || v.service.includes('Catering'))).toBe(true);
    expect(defaultVendors.some((v) => v.service.includes('Mehendi'))).toBe(true);
    expect(defaultVendors.some((v) => v.service.includes('Pandit'))).toBe(true);
  });

  it('provides general vendor templates for non-Indian celebrations', () => {
    const templates = Object.values(GENERAL_VENDOR_TEMPLATES);
    expect(templates.length).toBe(8);
    expect(templates.some((t) => t.service.includes('Venue'))).toBe(true);
    expect(templates.some((t) => t.service.includes('Photographer'))).toBe(true);
    expect(templates.some((t) => t.service.includes('Cake') || t.service.includes('Dessert'))).toBe(true);
  });
});

