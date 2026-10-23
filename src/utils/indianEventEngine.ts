// Indian Event Intelligence Engine
// Tailored for weddings, college fests, milestone birthdays, and community utsavs across India

import {
  IndianFunctionItem,
  IndianPermitItem,
  IndianCateringConfig,
  IndianBackupConfig,
  IndianEventConfig,
  EventType,
} from '../types';

/**
 * Format currency using Indian numbering system (Lakhs and Crores)
 * e.g., 2500000 -> ₹25,00,000 | ₹25 Lakhs
 */
export function formatIndianCurrency(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      const lk = amount / 100000;
      return `₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      const k = amount / 1000;
      return `₹${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)} k`;
    }
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Hindi Cultural Terminology & Guidance Dictionary
 */
export const HINDI_TERMS: Record<string, string> = {
  // Event Types
  wedding: 'शुभ विवाह समारोह',
  birthday: 'जन्मदिन उत्सव',
  community: 'सामुदायिक उत्सव',

  // Functions / Rituals
  roka: 'रोका / सगाई (Ring Ceremony)',
  engagement: 'सगाई व अंगूठी समारोह (Engagement)',
  tilak: 'तिलक व शगुन रस्म (Tilak Ceremony)',
  mehendi: 'मेहंदी की रस्म (Mehendi & Henna)',
  haldi: 'हल्दी समारोह (Haldi & Pithi)',
  sangeet: 'संगीत संध्या (Sangeet Night)',
  cocktail: 'कॉकटेल व संगीत संध्या (Cocktail & DJ)',
  baraat: 'भव्य बारात प्रस्थान व अगवानी (Baraat)',
  wedding_pheras: 'जयमाला व पवित्र सात फेरे (Main Shaadi)',
  vidaai: 'भावुक विदाई की रस्म (Vidaai Ceremony)',
  reception: 'विवाह प्रीतिभोज (Grand Reception)',
  custom_ritual: 'विशिष्ट पारिवारिक रस्म (Custom Ritual)',
  college_fest: 'वार्षिक सांस्कृतिक महोत्सव (College Fest)',
  community_utsav: 'सामुदायिक पूजा / उत्सव (Community Utsav)',
  birthday_puja: 'जन्मदिन पूजन व उत्सव (Birthday Bash)',

  // Categories
  'Venue & Accommodation': 'स्थान व आवास व्यवस्था (Venue & Stay)',
  'Catering & Mithai': 'खानपान, मिष्ठान व चाट (Catering & Food)',
  'Mandap & Florals': 'मंडप, स्टेज व पुष्प सज्जा (Decor & Florals)',
  'Photography & Video': 'फोटोग्राफी व सिनेमा (Photo & Video)',
  'Attire & Jewelry': 'पोशाक व आभूषण (Attire & Jewelry)',
  'DJ, Dhol & Entertainment': 'डीजे, ढोल व संगीत (DJ & Sound)',
  'Mehendi & Makeup': 'मेहंदी व ब्राइडल मेकअप (Beauty & Henna)',
  'Shagun & Gifts': 'शगुन, निमंत्रण व उपहार (Shagun & Favors)',
  'Logistics & Baraat': 'बारात, पंडित जी व दक्षिणा (Logistics & Rituals)',
  'Contingency Reserve': 'आपातकालीन आरक्षित निधि (Contingency Buffer)',

  // Dietary & Food Guard
  pure_veg: 'शुद्ध शाकाहारी (Pure Vegetarian)',
  jain_veg: 'जैन शाकाहारी - बिना कंदमूल (Jain - No Root Vegetables)',
  swaminarayan: 'स्वामीनारायण आहार (No Onion & Garlic)',
  mixed_veg_nonveg: 'शाकाहारी व मांसाहारी मिश्रित (Mixed Veg & Non-Veg)',
  halal_certified: 'हलाल प्रमाणित (Halal Certified)',

  // Power & Safety
  dg_backup: 'साइलेंट डीजी जनरेटर बैकअप (Silent DG Power Backup)',
  pandal_waterproofing: 'वाटरप्रूफ जर्मन हैंगर पंडाल (Waterproof German Hangar)',
  wheelchair_ramp: 'बुजुर्गों हेतु व्हीलचेयर रैंप (Elderly Wheelchair Ramp)',

  // Common UI Phrases
  indian_intelligence_title: 'भारतीय इवेंट इंटेलिजेंस (Indian Event Intelligence)',
  permit_verification_notice: 'अनुमतियां और वेंडर मूल्य वर्तमान विश्वसनीय स्रोत से सत्यापित करें।',
  unannounced_buffer_notice: 'भारतीय शादियों में 10% अप्रत्याशित अतिथियों के लिए अतिरिक्त भोजन सुरक्षित किया जाता है।',
};

export interface RitualTemplateInfo {
  type: import('../types').IndianFunctionType;
  title: string;
  hindiTitle: string;
  startTime: string;
  endTime: string;
  venueName: string;
  dressCode: string;
  defaultGuestRatio: number;
  ritualNotes: string;
}

export const INDIAN_RITUAL_TEMPLATES: Record<string, RitualTemplateInfo> = {
  haldi: {
    type: 'haldi',
    title: 'Phoolon Ki Haldi Ceremony',
    hindiTitle: 'फूलों की हल्दी व पिठी समारोह',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    venueName: 'Sunlit Terrace Garden / Lawn',
    dressCode: 'Sunlit Ochre & Pastel Yellow',
    defaultGuestRatio: 0.5,
    ritualNotes: 'Organic kasturi haldi, fresh yellow marigold petals shower, dhol walas, fresh coconut water station.',
  },
  mehendi: {
    type: 'mehendi',
    title: 'Mehendi & Henna Magic',
    hindiTitle: 'मेहंदी की रस्म एवं लोक संगीत',
    startTime: '03:00 PM',
    endTime: '08:00 PM',
    venueName: 'Poolside Lawn / Courtyard',
    dressCode: 'Bright Yellows, Greens & Floral Attire',
    defaultGuestRatio: 0.45,
    ritualNotes: 'Bangles station, 4 professional mehendi artists, live chaat counter, traditional dholki folk songs.',
  },
  sangeet: {
    type: 'sangeet',
    title: 'Musical Sangeet & Dance Night',
    hindiTitle: 'भव्य संगीत संध्या व नृत्य प्रतियोगिता',
    startTime: '07:30 PM',
    endTime: '11:30 PM',
    venueName: 'Main Grand Ballroom',
    dressCode: 'Glamorous Indo-Western / Sequins',
    defaultGuestRatio: 0.85,
    ritualNotes: 'Choreographed family dance entries, LED backdrop stage, DJ & live percussionist, 10 PM sound compliance.',
  },
  cocktail: {
    type: 'cocktail',
    title: 'Cocktail Gala & DJ Bash',
    hindiTitle: 'कॉकटेल संध्या व डीजे नाइट',
    startTime: '08:00 PM',
    endTime: '12:00 AM',
    venueName: 'Skyline Terrace / Lounge',
    dressCode: 'Evening Formals / Tuxedos & Gowns',
    defaultGuestRatio: 0.7,
    ritualNotes: 'Curated signature beverages, live acoustic band, finger food pass-arounds, LED dance floor.',
  },
  wedding_pheras: {
    type: 'wedding_pheras',
    title: 'Baraat, Varmala & Sacred Pheras',
    hindiTitle: 'भव्य बारात, वरमाला व सात फेरे',
    startTime: '05:00 PM',
    endTime: '11:00 PM',
    venueName: 'Palace Mandap Lawn & Temple Pavilion',
    dressCode: 'Regal Traditional (Sherwani / Lehengas)',
    defaultGuestRatio: 1.0,
    ritualNotes: 'Groom procession (Ghodi/Vintage car), Milni garlands, Varmala on elevated stage, Vedic pheras, Vidaai.',
  },
  reception: {
    type: 'reception',
    title: 'Grand Wedding Reception',
    hindiTitle: 'भव्य विवाह प्रीतिभोज व स्वागत समारोह',
    startTime: '07:30 PM',
    endTime: '11:30 PM',
    venueName: 'Royal Banquet Hall',
    dressCode: 'Formal Black Tie / Silk Sarees',
    defaultGuestRatio: 1.0,
    ritualNotes: 'Formal receiving line, stage photography sessions, multi-regional banquet dinner with live dessert counters.',
  },
  roka: {
    type: 'roka',
    title: 'Auspicious Roka & Shagun Ceremony',
    hindiTitle: 'शुभ रोका व सगाई शगुन समारोह',
    startTime: '11:00 AM',
    endTime: '03:00 PM',
    venueName: 'Intimate Banquet / Home',
    dressCode: 'Graceful Traditional Indian',
    defaultGuestRatio: 0.35,
    ritualNotes: 'Shagun exchange, priest blessings, dry fruit gifting, intimate festive lunch buffet.',
  },
  engagement: {
    type: 'engagement',
    title: 'Ring Exchange Ceremony',
    hindiTitle: 'सगाई व अंगूठी समारोह',
    startTime: '06:30 PM',
    endTime: '10:30 PM',
    venueName: 'Heritage Courtyard / Banquet',
    dressCode: 'Pastel Formals & Indo-Western',
    defaultGuestRatio: 0.6,
    ritualNotes: 'Ring exchange on stage, ceremonial cake cutting, family photo sessions, dinner buffet.',
  },
  baraat: {
    type: 'baraat',
    title: 'Baraat Procession & Swagat',
    hindiTitle: 'भव्य बारात प्रस्थान एवं स्वागत',
    startTime: '04:30 PM',
    endTime: '07:00 PM',
    venueName: 'Main Entrance & Courtyard',
    dressCode: 'Sherwani with Safa / Turban',
    defaultGuestRatio: 1.0,
    ritualNotes: 'Vintage car / Ghodi procession, brass band & Dhol Tasha, Milni welcoming with garland exchange.',
  },
  tilak: {
    type: 'tilak',
    title: 'Tilak & Sagai Ceremony',
    hindiTitle: 'पारंपरिक तिलक एवं शगुन रस्म',
    startTime: '04:00 PM',
    endTime: '07:30 PM',
    venueName: 'Traditional Courtyard / Hall',
    dressCode: 'Classic Kurta Pajama / Sarees',
    defaultGuestRatio: 0.4,
    ritualNotes: 'Traditional tilak by bride’s family, gift offerings, auspicious aarti, sweets distribution.',
  },
  vidaai: {
    type: 'vidaai',
    title: 'Vidaai & Doli Departure',
    hindiTitle: 'भावुक विदाई व डोली प्रस्थान',
    startTime: '11:00 PM',
    endTime: '12:00 AM',
    venueName: 'Mandap Portico Exit',
    dressCode: 'Traditional Indian',
    defaultGuestRatio: 0.6,
    ritualNotes: 'Rice tossing ritual, elder blessings, decorated car/doli departure ceremony.',
  },
  custom_ritual: {
    type: 'custom_ritual',
    title: 'Custom Cultural Ritual',
    hindiTitle: 'विशिष्ट पारिवारिक रस्म व पूजन',
    startTime: '04:00 PM',
    endTime: '07:30 PM',
    venueName: 'Ceremony Hall / Lawn',
    dressCode: 'Traditional Festive Attire',
    defaultGuestRatio: 0.5,
    ritualNotes: 'Custom family rituals, regional traditions, special catering and photography arrangements.',
  },
};

/**
 * Creates a new custom Indian ceremony function with smart defaults
 */
export function createCustomIndianRitual(
  type: import('../types').IndianFunctionType = 'haldi',
  targetDate?: string,
  totalGuests = 150
): import('../types').IndianFunctionItem {
  const template = INDIAN_RITUAL_TEMPLATES[type] || INDIAN_RITUAL_TEMPLATES.custom_ritual;
  const guestCount = Math.max(10, Math.round(totalGuests * (template.defaultGuestRatio || 0.5)));

  return {
    id: `fn-${type}-${Date.now()}`,
    type: template.type,
    title: template.title,
    hindiTitle: template.hindiTitle,
    date: targetDate || new Date().toISOString().split('T')[0],
    startTime: template.startTime,
    endTime: template.endTime,
    venueName: template.venueName,
    dressCode: template.dressCode,
    expectedGuests: guestCount,
    ritualNotes: template.ritualNotes,
    isCompleted: false,
  };
}

/**
 * Default Indian Multi-Day Function Sequences
 */
export function generateDefaultIndianFunctions(
  eventType: EventType,
  totalGuests: number,
  baseDate?: string
): IndianFunctionItem[] {
  const targetDate = baseDate || new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
  const dateObj = new Date(targetDate);

  if (eventType === 'wedding') {
    // 3-Day Wedding Ceremony Sequence
    const dMinus2 = new Date(dateObj.getTime() - 2 * 86400000).toISOString().split('T')[0];
    const dMinus1 = new Date(dateObj.getTime() - 1 * 86400000).toISOString().split('T')[0];
    const dDay = targetDate;
    const dPlus1 = new Date(dateObj.getTime() + 1 * 86400000).toISOString().split('T')[0];

    return [
      {
        id: 'fn-mehendi',
        type: 'mehendi',
        title: 'Mehendi & Folk Beats',
        hindiTitle: 'मेहंदी एवं लोक संगीत',
        date: dMinus2,
        startTime: '03:00 PM',
        endTime: '08:00 PM',
        venueName: 'Poolside Lawn / Courtyard',
        dressCode: 'Bright Yellows, Greens & Floral Attire',
        expectedGuests: Math.round(totalGuests * 0.45),
        ritualNotes: 'Bangles station, fresh marigold decor, 4 professional mehendi artists, live chaat counter.',
        isCompleted: false,
      },
      {
        id: 'fn-haldi',
        type: 'haldi',
        title: 'Phoolon Ki Haldi Ceremony',
        hindiTitle: 'फूलों की हल्दी व पिठी',
        date: dMinus1,
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        venueName: 'Sunlit Terrace Garden',
        dressCode: 'Sunlit Ochre & Pastel Yellow',
        expectedGuests: Math.round(totalGuests * 0.5),
        ritualNotes: 'Organic kasturi haldi, rose petals shower, dhol walas, traditional sweets and coconut water.',
        isCompleted: false,
      },
      {
        id: 'fn-sangeet',
        type: 'sangeet',
        title: 'Musical Sangeet & Cocktail Extravaganza',
        hindiTitle: 'भव्य संगीत व कॉकटेल संध्या',
        date: dMinus1,
        startTime: '07:30 PM',
        endTime: '11:30 PM',
        venueName: 'Main Grand Ballroom',
        dressCode: 'Glamorous Indo-Western / Sequins',
        expectedGuests: Math.round(totalGuests * 0.85),
        ritualNotes: 'Choreographed family dance entries, LED backdrop screen, DJ & live percussionist, 10 PM sound compliance.',
        isCompleted: false,
      },
      {
        id: 'fn-pheras',
        type: 'wedding_pheras',
        title: 'Baraat, Varmala & Sacred Pheras',
        hindiTitle: 'भव्य बारात, वरमाला व सात फेरे',
        date: dDay,
        startTime: '05:00 PM',
        endTime: '11:00 PM',
        venueName: 'Palace Mandap Lawn & Temple Pavilion',
        dressCode: 'Regal Traditional (Sherwani / Lehengas)',
        expectedGuests: totalGuests,
        ritualNotes: 'Groom procession (Ghodi/Vintage car), Milni ceremony, Varmala on elevated stage, Vedic pheras, Vidaai.',
        isCompleted: false,
      },
      {
        id: 'fn-reception',
        type: 'reception',
        title: 'Grand Wedding Reception',
        hindiTitle: 'भव्य विवाह प्रीतिभोज व स्वागत समारोह',
        date: dPlus1,
        startTime: '07:30 PM',
        endTime: '11:00 PM',
        venueName: 'Royal Banquet Hall',
        dressCode: 'Formal Black Tie / Silk Sarees',
        expectedGuests: totalGuests,
        ritualNotes: 'Formal receiving line, stage photography sessions, multi-regional banquet dinner with live dessert counters.',
        isCompleted: false,
      },
    ];
  }

  if (eventType === 'birthday') {
    return [
      {
        id: 'fn-bday-puja',
        type: 'birthday_puja',
        title: 'Morning Havan & Family Blessings',
        hindiTitle: 'शुभ जन्मदिवस पूजन व हवन',
        date: targetDate,
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        venueName: 'Home Pooja Room / Temple',
        dressCode: 'Traditional Indian',
        expectedGuests: Math.min(30, totalGuests),
        ritualNotes: 'Ayushya havan, priest dakshina, prasad distribution.',
        isCompleted: false,
      },
      {
        id: 'fn-bday-party',
        type: 'birthday_puja',
        title: 'Evening Celebration, Cake & DJ Bash',
        hindiTitle: 'शाम की पार्टी, केक कटिंग व डीजे',
        date: targetDate,
        startTime: '06:30 PM',
        endTime: '10:30 PM',
        venueName: 'Clubhouse Banquet',
        dressCode: 'Party Wear / Smart Casual',
        expectedGuests: totalGuests,
        ritualNotes: 'Theme cake cutting, arcade games, live chaat counter, DJ dance floor.',
        isCompleted: false,
      },
    ];
  }

  // Community / College Fest
  return [
    {
      id: 'fn-inauguration',
      type: 'college_fest',
      title: 'Inaugural Ceremony & Lamp Lighting',
      hindiTitle: 'उद्घाटन समारोह व दीप प्रज्वलन',
      date: targetDate,
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      venueName: 'Main Auditorium',
      dressCode: 'College Ethnic Day',
      expectedGuests: Math.round(totalGuests * 0.4),
      ritualNotes: 'Chief guest address, classical dance performance, college anthem.',
      isCompleted: false,
    },
    {
      id: 'fn-fest-concert',
      type: 'college_fest',
      title: 'Star Performer Concert & DJ Night',
      hindiTitle: 'मुख्य कलाकार कॉन्सर्ट व डीजे नाइट',
      date: targetDate,
      startTime: '05:30 PM',
      endTime: '10:00 PM',
      venueName: 'College Open Air Grounds',
      dressCode: 'Casual / Fest Merch',
      expectedGuests: totalGuests,
      ritualNotes: 'Celebrity artist band, line array sound, student security barricades, police bandobast, strict 10 PM wrap.',
      isCompleted: false,
    },
  ];
}

/**
 * Standard Statutory & Compliance Permits for Indian Events
 * (Items clearly marked with 'to_verify' status unless verified)
 */
export function generateDefaultIndianPermits(eventType: EventType): IndianPermitItem[] {
  const commonPermits: IndianPermitItem[] = [
    {
      id: 'pm-sound-noc',
      title: 'Sound & Loudspeaker NOC (10:00 PM Curfew)',
      hindiTitle: 'ध्वनिविस्तारक व लाउडस्पीकर अनुमति (रात 10 बजे तक)',
      authority: 'Local Police Division & Sub-Divisional Magistrate (SDM)',
      status: 'to_verify',
      estimatedFeeInr: 2500,
      guidance:
        'Noise Pollution (Regulation & Control) Rules require prior police permission for amplified outdoor sound. Music outdoors must stop strictly at 10:00 PM in residential and urban banquet zones.',
      isMandatory: true,
      sourceType: 'statutory_norm',
    },
    {
      id: 'pm-ppl-iprs',
      title: 'PPL & IPRS Public Performance Music License',
      hindiTitle: 'पीपीएल व आईपीआरएस कॉपीराइट संगीत लाइसेंस',
      authority: 'Phonographic Performance Ltd (PPL) & IPRS India',
      status: 'to_verify',
      estimatedFeeInr: 12000,
      guidance:
        'Playing copyrighted commercial Bollywood, Punjabi, and international songs via DJ or live band at commercial banquets requires PPL/IPRS clearance to prevent copyright notices or day-of injunctions.',
      isMandatory: true,
      sourceType: 'statutory_norm',
    },
    {
      id: 'pm-fire-noc',
      title: 'Fire Safety NOC (Mandap Havan & Cold Pyro)',
      hindiTitle: 'अग्निशमन विभाग अनापत्ति प्रमाण पत्र (हवन व पायरो)',
      authority: 'Municipal Fire Service Department',
      status: 'to_verify',
      estimatedFeeInr: 5000,
      guidance:
        'Required when conducting indoor open-flame Vedic havans or utilizing cold pyrotechnics (cold sparks) during stage entries in enclosed banquet halls.',
      isMandatory: eventType === 'wedding',
      sourceType: 'statutory_norm',
    },
    {
      id: 'pm-liquor-license',
      title: 'One-Day Occasional Liquor Permit (L-49 / P-10)',
      hindiTitle: 'एक दिवसीय आबकारी मदिरा परमिट (फॉर्म L-49)',
      authority: 'State Excise Department',
      status: 'to_verify',
      estimatedFeeInr: 10000,
      guidance:
        'Mandatory if serving alcohol at Sangeet or Cocktail functions. All liquor bottles must be purchased from authorized state vends with valid holographic excise stamps.',
      isMandatory: false,
      sourceType: 'statutory_norm',
    },
    {
      id: 'pm-venue-outside-catering',
      title: 'Venue Outside Catering & Decor Royalty Verification',
      hindiTitle: 'वेन्यू बाहरी कैटरिंग व डेकोर रॉयल्टी जांच',
      authority: 'Banquet / Farmhouse Administration',
      status: 'to_verify',
      estimatedFeeInr: 50000,
      guidance:
        'Many private venues levy a heavy royalty or penalty (₹30,000 to ₹1,50,000) if hiring external caterers or decorators. Must be verified in the written contract before booking advance.',
      isMandatory: true,
      sourceType: 'vendor_claim',
    },
    {
      id: 'pm-traffic-baraat',
      title: 'Traffic Police Clearance for Baraat Road Procession',
      hindiTitle: 'बारात मार्ग हेतु यातायात पुलिस अनुमति',
      authority: 'Local Traffic Police Division',
      status: 'to_verify',
      estimatedFeeInr: 1500,
      guidance:
        'Required if the groom’s procession involves brass bands, horses, or vintage cars that temporarily utilize or restrict main public thoroughfares.',
      isMandatory: false,
      sourceType: 'statutory_norm',
    },
  ];

  if (eventType === 'community' || eventType === 'wedding') {
    return commonPermits;
  }

  // Simplified for birthdays
  return commonPermits.filter((p) => p.id === 'pm-sound-noc' || p.id === 'pm-venue-outside-catering');
}

/**
 * Default Indian Catering Configurations
 */
export function generateDefaultIndianCatering(eventType: EventType, guestCount: number): IndianCateringConfig {
  return {
    dietType: eventType === 'wedding' ? 'pure_veg' : 'mixed_veg_nonveg',
    vegPercentage: eventType === 'wedding' ? 80 : 60,
    nonVegPercentage: eventType === 'wedding' ? 20 : 40,
    jainGuestCount: Math.max(10, Math.round(guestCount * 0.1)),
    platePriceEstimate: eventType === 'wedding' ? 1200 : 650,
    liveChaatCounters: true,
    mithaiLiveCounters: true,
    beveragePaanCounter: true,
    unannouncedBufferPercent: 10,
    notes: 'Separate sterilized vessels for Jain and Pure Veg food. Live Jalebi, Rabdi, and Kulfi stations included.',
  };
}

/**
 * Calculates deterministic catering costs and plate counts with Indian unannounced guest buffer
 */
export function calculateIndianCateringBreakdown(
  guestCount: number,
  config: IndianCateringConfig
): {
  guaranteedPlates: number;
  bufferPlates: number;
  totalPreparedPlates: number;
  vegPlates: number;
  jainPlates: number;
  nonVegPlates: number;
  baseFoodCost: number;
  liveStationsCost: number;
  totalCateringEstimate: number;
} {
  const guaranteed = Math.max(0, guestCount);
  const bufferPlates = Math.ceil((guaranteed * (config.unannouncedBufferPercent || 10)) / 100);
  const totalPreparedPlates = guaranteed + bufferPlates;

  const jainPlates = Math.min(totalPreparedPlates, Math.max(0, config.jainGuestCount || 0));
  const remainingPlates = Math.max(0, totalPreparedPlates - jainPlates);

  let vegPlates = 0;
  let nonVegPlates = 0;

  if (config.dietType === 'pure_veg' || config.dietType === 'jain_veg' || config.dietType === 'swaminarayan') {
    vegPlates = remainingPlates;
    nonVegPlates = 0;
  } else {
    const vegRatio = (config.vegPercentage || 60) / 100;
    vegPlates = Math.round(remainingPlates * vegRatio);
    nonVegPlates = Math.max(0, remainingPlates - vegPlates);
  }

  // Live counters additional cost estimates
  let liveStationsCost = 0;
  if (config.liveChaatCounters) liveStationsCost += totalPreparedPlates * 85;
  if (config.mithaiLiveCounters) liveStationsCost += totalPreparedPlates * 95;
  if (config.beveragePaanCounter) liveStationsCost += totalPreparedPlates * 45;

  const baseFoodCost = totalPreparedPlates * (config.platePriceEstimate || 1000);
  const totalCateringEstimate = baseFoodCost + liveStationsCost;

  return {
    guaranteedPlates: guaranteed,
    bufferPlates,
    totalPreparedPlates,
    vegPlates,
    jainPlates,
    nonVegPlates,
    baseFoodCost,
    liveStationsCost,
    totalCateringEstimate,
  };
}

/**
 * Default Backup & Accessibility Configurations
 */
export function generateDefaultIndianBackups(): IndianBackupConfig {
  return {
    hasDualDGSet: true, // Dual silent generator backup essential in Indian venues
    pandalWaterproofing: true, // German hangar / rainproof canopy
    summerMistFans: true, // High-pressure mist fans for hot outdoor lawns
    winterPatioHeaters: false, // Turned on in winter North India
    elderlyWheelchairAccess: true, // Ramps to stage and mandap
    elderlyDiningProximity: true, // Seating within 20m of dining & washroom
  };
}

/**
 * Initializes full Indian Event Configuration for an EventPlan
 */
export function initializeIndianEventConfig(
  eventType: EventType,
  guestCount: number,
  eventDate?: string
): IndianEventConfig {
  return {
    isEnabled: true,
    region: 'North',
    language: 'en',
    functions: generateDefaultIndianFunctions(eventType, guestCount, eventDate),
    catering: generateDefaultIndianCatering(eventType, guestCount),
    permits: generateDefaultIndianPermits(eventType),
    backups: generateDefaultIndianBackups(),
  };
}

/**
 * Standard Indian Wedding Service Partner / Vendor Templates
 */
export interface VendorTemplateItem {
  id: string;
  service: string;
  hindiTitle?: string;
  urgency: 'Immediate' | 'Standard' | 'Flexible';
  targetLeadTime: string;
  recommendedBudgetRange: string;
  questions: string[];
}

export const INDIAN_VENDOR_TEMPLATES: Record<string, VendorTemplateItem> = {
  mandap_decor: {
    id: 'v-in-decor',
    service: 'Mandap, Stage & Floral Decor',
    hindiTitle: 'मंडप, जयमाला स्टेज व पुष्प सज्जा',
    urgency: 'Immediate',
    targetLeadTime: '6-9 months prior',
    recommendedBudgetRange: '₹2,50,000 - ₹6,00,000 (15% - 20% of budget)',
    questions: [
      'Do you provide fire-retardant fabric and proper smoke ventilation for the sacred havan kund pheras?',
      'Are fresh vs artificial flowers clearly itemized for the entrance walkway and stage backdrop?',
      'What is your strike-down and setup turnaround time between evening Sangeet and morning Haldi?',
    ],
  },
  catering_halwai: {
    id: 'v-in-catering',
    service: 'Royal Catering, Halwai & Live Counters',
    hindiTitle: 'शाही कैटरिंग, हलवाई व लाइव चाट काउंटर',
    urgency: 'Immediate',
    targetLeadTime: '6-9 months prior',
    recommendedBudgetRange: '₹6,00,000 - ₹12,00,000 (30% - 38% of budget)',
    questions: [
      'Can you guarantee strictly segregated kitchen preparation areas and serving utensils for Jain and Pure Veg food?',
      'How do you manage the +10% unannounced buffer plates during peak baarat arrival rush?',
      'Are live interactive stations (chaat, hot jalebi-rabdi, kulfi, tandoor, kulhad chai) included in base pricing?',
    ],
  },
  photography: {
    id: 'v-in-photo',
    service: 'Wedding Photography & Cinematic Film',
    hindiTitle: 'वेडिंग फोटोग्राफी, सिनेमैटिक फिल्म व ड्रोन',
    urgency: 'Immediate',
    targetLeadTime: '6-9 months prior',
    recommendedBudgetRange: '₹1,50,000 - ₹3,50,000 (8% - 12% of budget)',
    questions: [
      'Does your team cover all multi-day rituals (Haldi, Mehendi, Sangeet, Baraat, Pheras, Reception) with dedicated candid photographers?',
      'Can you deliver a 1-minute cinematic teaser reel within 48 hours for immediate social media sharing?',
      'Do you provide raw 4K footage and what is the turnaround timeline for the physical handcrafted album?',
    ],
  },
  mehendi: {
    id: 'v-in-mehendi',
    service: 'Bridal & Guest Mehendi Artists',
    hindiTitle: 'ब्राइडल व गेस्ट मेहंदी आर्टिस्ट टीम',
    urgency: 'Standard',
    targetLeadTime: '3-5 months prior',
    recommendedBudgetRange: '₹25,000 - ₹65,000',
    questions: [
      'Is 100% certified organic, chemical-free henna used to ensure dark rich color without skin irritation?',
      'How many assistant artists will accompany the lead to apply henna for 50+ female guests without long queues?',
      'Does the bridal package include full elbow-length arms and feet with customized personalized wedding story motifs?',
    ],
  },
  dhol_dj: {
    id: 'v-in-dhol-dj',
    service: 'Baraat Brass Band, Dhol Walas & DJ Sound',
    hindiTitle: 'बारात ब्रास बैंड, ढोल ताशा व संगीत डीजे',
    urgency: 'Standard',
    targetLeadTime: '4-6 months prior',
    recommendedBudgetRange: '₹50,000 - ₹1,50,000',
    questions: [
      'How many Punjabi dhol walas and brass band players are provided for the groom’s baraat procession?',
      'Do you comply with the 10:00 PM outdoor statutory sound curfew and smoothly transition to indoor acoustic DJ?',
      'Can you provide wireless clip-on microphones and sound balance for the Pandit Ji during the sacred pheras?',
    ],
  },
  makeup_artist: {
    id: 'v-in-mua',
    service: 'Bridal Makeup & Hair Styling (MUA)',
    hindiTitle: 'ब्राइडल मेकअप, हेयर स्टाइलिंग व ड्रेपिंग',
    urgency: 'Immediate',
    targetLeadTime: '5-8 months prior',
    recommendedBudgetRange: '₹35,000 - ₹85,000',
    questions: [
      'Are pre-wedding makeup and hair trial sessions included in the package?',
      'Does the artist stay on-site for look changes between morning Pheras and evening Reception?',
      'Is professional heavy lehenga and dupatta pinning / draping assistance included for the bride and mother?',
    ],
  },
  pandit_ji: {
    id: 'v-in-pandit',
    service: 'Vedic Pandit Ji / Officiant',
    hindiTitle: 'विद्वान पंडित जी / वैदिक पुरोहित',
    urgency: 'Standard',
    targetLeadTime: '2-4 months prior',
    recommendedBudgetRange: '₹15,000 - ₹35,000',
    questions: [
      'Will you provide the complete list of puja samagri (havan samagri, gangajal, kalash, coconut) well in advance?',
      'Can you explain the significance of the 7 sacred pheras in bilingual Hindi/English so all attendees feel connected?',
      'What is the exact auspicious lagna muhurat window for the varmala and pheras?',
    ],
  },
  generator_backup: {
    id: 'v-in-dg',
    service: 'Silent DG Generator & Power Backup',
    hindiTitle: 'साइलेंट डीजी सेट व आपातकालीन बिजली बैकअप',
    urgency: 'Standard',
    targetLeadTime: '2-3 months prior',
    recommendedBudgetRange: '₹30,000 - ₹65,000',
    questions: [
      'What is the kVA capacity of the silent DG set and does it support simultaneous AC + heavy stage illumination?',
      'Is an automated changeover switch installed to prevent even a 2-second blackout during the sacred pheras?',
      'Is dedicated diesel fuel and a licensed technician on standby throughout the 12-hour ceremony?',
    ],
  },
};

export const GENERAL_VENDOR_TEMPLATES: Record<string, VendorTemplateItem> = {
  venue: {
    id: 'v-gen-venue',
    service: 'Reception & Ceremony Venue',
    urgency: 'Immediate',
    targetLeadTime: '9-12 months prior',
    recommendedBudgetRange: '35% - 45% of total budget',
    questions: [
      'What is your cancellation and date postponement policy?',
      'Are tables, chairs, and standard linens included in the venue rental fee?',
      'What are the sound curfew and alcohol licensing restrictions?',
    ],
  },
  catering: {
    id: 'v-gen-catering',
    service: 'Catering & Beverage Bar Team',
    urgency: 'Immediate',
    targetLeadTime: '6-8 months prior',
    recommendedBudgetRange: '25% - 35% of total budget',
    questions: [
      'Can we schedule a private tasting before signing the contract?',
      'How do you accommodate severe allergies and vegan/vegetarian guests?',
      'What is your server and bartender staffing ratio per 50 guests?',
    ],
  },
  photography: {
    id: 'v-gen-photo',
    service: 'Professional Event Photographer',
    urgency: 'Immediate',
    targetLeadTime: '6-9 months prior',
    recommendedBudgetRange: '10% - 15% of total budget',
    questions: [
      'How many hours of coverage are included and do you bring a second shooter?',
      'What is the turnaround time for the full edited high-res digital gallery?',
      'Have you shot at our venue or in similar ambient lighting conditions?',
    ],
  },
  dj_sound: {
    id: 'v-gen-dj',
    service: 'DJ & Sound Production',
    urgency: 'Standard',
    targetLeadTime: '4-6 months prior',
    recommendedBudgetRange: '6% - 10% of total budget',
    questions: [
      'Do you provide all sound equipment, wireless microphones, and dance floor lighting?',
      'Can we submit a strict "must-play" and "do-not-play" song list?',
      'What backup audio equipment do you bring in case of technical malfunction?',
    ],
  },
  florals_decor: {
    id: 'v-gen-decor',
    service: 'Florals, Styling & Event Rentals',
    urgency: 'Standard',
    targetLeadTime: '4-6 months prior',
    recommendedBudgetRange: '8% - 12% of total budget',
    questions: [
      'Can you create centerpiece samples before final approval?',
      'Do you handle delivery, setup, and late-night breakdown / removal?',
      'Can ceremony florals be repurposed for the reception dinner tables?',
    ],
  },
  bakery: {
    id: 'v-gen-bakery',
    service: 'Specialty Cake & Dessert Station',
    urgency: 'Flexible',
    targetLeadTime: '2-4 months prior',
    recommendedBudgetRange: '2% - 4% of total budget',
    questions: [
      'Do you offer tasting boxes for flavor and filling selection?',
      'What is your delivery window and setup protocol for delicate multi-tier cakes?',
      'Are allergen-friendly (gluten-free, nut-free, vegan) cupcakes available?',
    ],
  },
  transport: {
    id: 'v-gen-shuttle',
    service: 'Guest Shuttle & Transportation',
    urgency: 'Flexible',
    targetLeadTime: '3-4 months prior',
    recommendedBudgetRange: '3% - 5% of total budget',
    questions: [
      'What is the vehicle fleet size and passenger capacity per shuttle run?',
      'Are drivers commercially licensed with real-time GPS tracking?',
      'What is the overtime rate if reception dancing runs 30 minutes late?',
    ],
  },
  coordinator: {
    id: 'v-gen-coordinator',
    service: 'Day-of Event Coordinator',
    urgency: 'Standard',
    targetLeadTime: '4-6 months prior',
    recommendedBudgetRange: '5% - 8% of total budget',
    questions: [
      'How many weeks prior to the event do you take over vendor management?',
      'Do you run the rehearsal and manage the minute-by-minute run-of-show?',
      'How many assistant coordinators will be on-site on the event day?',
    ],
  },
};

/**
 * Generates default service partners for Indian Celebrations
 */
export function generateDefaultIndianVendors(
  guestCount = 250,
  totalBudgetINR = 2500000
): import('../types').VendorItem[] {
  return Object.values(INDIAN_VENDOR_TEMPLATES).map((tmpl, idx) => ({
    id: `vnd-in-${idx + 1}`,
    service: tmpl.service,
    urgency: tmpl.urgency,
    status: 'to_research' as const,
    targetLeadTime: tmpl.targetLeadTime,
    recommendedBudgetRange: tmpl.recommendedBudgetRange,
    questions: tmpl.questions,
  }));
}

