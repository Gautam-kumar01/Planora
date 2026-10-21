import { EventPlan, OnboardingFormValues } from '../types';
import { generateDeterministicBudget } from './deterministicMath';
import { getStoredApiKey, isOpenRouterKey } from './storage';

export async function generateEventPlanWithAI(formData: OnboardingFormValues): Promise<EventPlan> {
  const apiKey = getStoredApiKey();

  if (apiKey) {
    try {
      let planFromAI: any;
      if (isOpenRouterKey(apiKey)) {
        planFromAI = await callOpenRouterAPI(formData, apiKey);
      } else {
        planFromAI = await callGeminiAPI(formData, apiKey);
      }

      if (planFromAI) {
        return reconcileAndSanitizePlan(planFromAI, formData);
      }
    } catch (err) {
      console.warn('AI API call failed, falling back to deterministic smart engine:', err);
    }
  }

  // Fallback to Instant Deterministic Plan Generator
  return generateDeterministicPlan(formData);
}

/**
 * Tests live connection with the provided API key (supports OpenRouter and Google Gemini)
 */
export async function testAiConnection(apiKey: string): Promise<{
  success: boolean;
  model: string;
  message: string;
}> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, model: 'none', message: 'No API key provided' };
  }

  const trimmed = apiKey.trim();
  const isOpenRouter = isOpenRouterKey(trimmed);

  if (isOpenRouter) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${trimmed}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173/',
          'X-Title': 'Planora Event Planner',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Say OK' }],
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${res.status}`;
        return { success: false, model: 'google/gemini-2.5-flash', message: errMsg };
      }

      return {
        success: true,
        model: 'google/gemini-2.5-flash (via OpenRouter)',
        message: 'Successfully connected to OpenRouter with Google Gemini 2.5 Flash!',
      };
    } catch (e: any) {
      return { success: false, model: 'google/gemini-2.5-flash', message: e.message || 'Network error' };
    }
  } else {
    // Google Gemini Direct
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${trimmed}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, model: 'gemini-2.5-flash', message: `Google API Error: ${res.status}` };
      }

      return {
        success: true,
        model: 'Google Gemini 2.5 Flash',
        message: 'Successfully connected directly to Google Gemini API!',
      };
    } catch (e: any) {
      return { success: false, model: 'gemini-2.5-flash', message: e.message || 'Network error' };
    }
  }
}

/**
 * Direct call to Google Gemini Generative Language API with Structured JSON Schema
 */
async function callGeminiAPI(formData: OnboardingFormValues, apiKey: string): Promise<any> {
  const prompt = `You are Planora, an expert AI celebration and event planner. 
Generate a comprehensive, actionable, and structured master plan for the following event:
- Event Type: ${formData.eventType}
- Event Title: ${formData.title}
- Guest Count: ${formData.guestCount}
- Total Budget: ${formData.totalBudget} ${formData.currency}
- Date / Timeline: ${formData.eventDate || 'Flexible / Undecided'}
- Location: ${formData.location || 'Local venue'}
- Desired Vibe: ${formData.vibe || 'Festive and memorable'}
- Priorities: ${formData.priorities.join(', ') || 'Overall guest experience'}
- Dietary Notes: ${formData.dietaryNotes || 'Standard crowd-pleasing options'}
- Accessibility & Constraints: ${formData.accessibilityNeeds || 'None'} / ${formData.constraints || 'None'}

CRITICAL ARITHMETIC RULES:
1. Ensure the sum of all budget item recommended amounts EXACTLY matches the total budget of ${formData.totalBudget}.
2. Always include a "Contingency Reserve" line item (5-10% of total budget).
3. Do NOT hallucinate specific phone numbers or physical addresses.
4. Provide realistic booking lead times and 3 sharp interview questions for each vendor.

Respond ONLY with valid JSON matching this schema:
{
  "eventName": "${formData.title}",
  "summary": "1-2 sentence executive summary of the event vision",
  "assumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "themeConcept": {
    "title": "Creative Theme Name",
    "description": "Atmosphere and aesthetic styling description",
    "colorPalette": [
      { "name": "Color Name", "hex": "#RRGGBB" }
    ],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
  },
  "budget": {
    "total": ${formData.totalBudget},
    "currency": "${formData.currency}",
    "items": [
      { "category": "Category Name", "recommendedAmount": 1000, "percentage": 25, "rationale": "Why this allocation" }
    ]
  },
  "timeline": [
    {
      "timeframe": "e.g. Phase 1: 3-4 Months Prior",
      "tasks": [
        { "title": "Task title", "category": "Logistics", "priority": "High" }
      ]
    }
  ],
  "runOfShow": [
    { "time": "09:00 AM", "activity": "Activity description", "owner": "Role", "location": "Spot" }
  ],
  "vendorChecklist": [
    {
      "service": "Service Name",
      "urgency": "Immediate | Standard | Flexible",
      "targetLeadTime": "Booking lead time",
      "recommendedBudgetRange": "Price range estimate",
      "keyQuestions": ["Question 1", "Question 2", "Question 3"]
    }
  ],
  "personalizedIdeas": {
    "activities": [
      { "title": "Activity name", "description": "How it works", "estimatedCost": "$X supplies" }
    ],
    "foodAndBeverage": [
      { "title": "Menu item or drink", "description": "Taste and serving notes" }
    ],
    "decorAndAtmosphere": [
      { "title": "Styling element", "description": "Visual decor advice" }
    ],
    "diyHacks": ["Money saving hack 1", "Hack 2", "Hack 3"]
  }
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.3,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  return JSON.parse(rawText);
}

/**
 * Direct call to OpenRouter API with Structured JSON Output
 */
async function callOpenRouterAPI(formData: OnboardingFormValues, apiKey: string): Promise<any> {
  const prompt = `You are Planora, an expert AI celebration and event planner. 
Generate a comprehensive, actionable, and structured master plan for the following event:
- Event Type: ${formData.eventType}
- Event Title: ${formData.title}
- Guest Count: ${formData.guestCount}
- Total Budget: ${formData.totalBudget} ${formData.currency}
- Date / Timeline: ${formData.eventDate || 'Flexible / Undecided'}
- Location: ${formData.location || 'Local venue'}
- Desired Vibe: ${formData.vibe || 'Festive and memorable'}
- Priorities: ${formData.priorities.join(', ') || 'Overall guest experience'}
- Dietary Notes: ${formData.dietaryNotes || 'Standard crowd-pleasing options'}
- Accessibility & Constraints: ${formData.accessibilityNeeds || 'None'} / ${formData.constraints || 'None'}

CRITICAL ARITHMETIC RULES:
1. Ensure the sum of all budget item recommended amounts EXACTLY matches the total budget of ${formData.totalBudget}.
2. Always include a "Contingency Reserve" line item (5-10% of total budget).
3. Do NOT hallucinate specific phone numbers or physical addresses.
4. Provide realistic booking lead times and 3 sharp interview questions for each vendor.

Respond ONLY with valid JSON matching this schema:
{
  "eventName": "${formData.title}",
  "summary": "1-2 sentence executive summary of the event vision",
  "assumptions": ["assumption 1", "assumption 2", "assumption 3"],
  "themeConcept": {
    "title": "Creative Theme Name",
    "description": "Atmosphere and aesthetic styling description",
    "colorPalette": [
      { "name": "Color Name", "hex": "#RRGGBB" }
    ],
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
  },
  "budget": {
    "total": ${formData.totalBudget},
    "currency": "${formData.currency}",
    "items": [
      { "category": "Category Name", "recommendedAmount": 1000, "percentage": 25, "rationale": "Why this allocation" }
    ]
  },
  "timeline": [
    {
      "timeframe": "e.g. Phase 1: 3-4 Months Prior",
      "tasks": [
        { "title": "Task title", "category": "Logistics", "priority": "High" }
      ]
    }
  ],
  "runOfShow": [
    { "time": "09:00 AM", "activity": "Activity description", "owner": "Role", "location": "Spot" }
  ],
  "vendorChecklist": [
    {
      "service": "Service Name",
      "urgency": "Immediate | Standard | Flexible",
      "targetLeadTime": "Booking lead time",
      "recommendedBudgetRange": "Price range estimate",
      "keyQuestions": ["Question 1", "Question 2", "Question 3"]
    }
  ],
  "personalizedIdeas": {
    "activities": [
      { "title": "Activity name", "description": "How it works", "estimatedCost": "$X supplies" }
    ],
    "foodAndBeverage": [
      { "title": "Menu item or drink", "description": "Taste and serving notes" }
    ],
    "decorAndAtmosphere": [
      { "title": "Styling element", "description": "Visual decor advice" }
    ],
    "diyHacks": ["Money saving hack 1", "Hack 2", "Hack 3"]
  }
}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173/',
        'X-Title': 'Planora Event Planner',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are Planora, an expert AI celebration and event planner. Return pure valid JSON strictly conforming to the requested schema. Do not enclose in markdown ticks.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    const rawText = json.choices?.[0]?.message?.content;
    if (!rawText) throw new Error('Empty response from OpenRouter');

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Reconciles and sanitizes AI response to guarantee mathematical accuracy and type conformance
 */
function reconcileAndSanitizePlan(aiData: any, formData: OnboardingFormValues): EventPlan {
  const budgetItems = (aiData.budget?.items || []).map((item: any, idx: number) => ({
    id: `b-${idx + 1}-${Date.now()}`,
    category: item.category || 'General',
    allocatedAmount: Number(item.recommendedAmount) || 0,
    spentAmount: 0,
    percentage: Number(item.percentage) || 0,
    notes: item.rationale || '',
    isContingency: (item.category || '').toLowerCase().includes('contingency'),
  }));

  // Reconcile total arithmetic
  let sum = budgetItems.reduce((acc: number, cur: any) => acc + cur.allocatedAmount, 0);
  const diff = formData.totalBudget - sum;
  if (diff !== 0 && budgetItems.length > 0) {
    const contingency = budgetItems.find((b: any) => b.isContingency) || budgetItems[budgetItems.length - 1];
    contingency.allocatedAmount += diff;
  }

  // Recalculate percentages
  budgetItems.forEach((b: any) => {
    b.percentage = formData.totalBudget > 0 ? Math.round((b.allocatedAmount / formData.totalBudget) * 100) : 0;
  });

  const timeline = (aiData.timeline || []).map((t: any, sIdx: number) => ({
    id: `tl-${sIdx + 1}`,
    period: t.timeframe || `Phase ${sIdx + 1}`,
    tasks: (t.tasks || []).map((tk: any, tIdx: number) => ({
      id: `task-${sIdx + 1}-${tIdx + 1}`,
      title: tk.title || 'Event preparation step',
      completed: false,
      category: tk.category || 'Logistics',
      priority: tk.priority === 'High' ? 'High' : tk.priority === 'Medium' ? 'Medium' : 'Low',
    })),
  }));

  const runOfShow = (aiData.runOfShow || []).map((r: any, rIdx: number) => ({
    id: `ros-${rIdx + 1}`,
    time: r.time || `${8 + rIdx}:00 AM`,
    activity: r.activity || 'Scheduled milestone',
    owner: r.owner || 'Coordinator',
    location: r.location || 'Main Area',
  }));

  const vendors = (aiData.vendorChecklist || []).map((v: any, vIdx: number) => ({
    id: `vnd-${vIdx + 1}`,
    service: v.service || 'Service Partner',
    urgency: v.urgency || 'Standard',
    status: 'to_research',
    targetLeadTime: v.targetLeadTime || '3-6 months prior',
    recommendedBudgetRange: v.recommendedBudgetRange || '$500 - $1,500',
    questions: Array.isArray(v.keyQuestions) ? v.keyQuestions.slice(0, 3) : ['What is your standard contract cancellation policy?'],
  }));

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    basics: {
      eventType: formData.eventType,
      title: formData.title,
      dateType: formData.dateType,
      eventDate: formData.eventDate,
      guestCount: formData.guestCount,
      location: formData.location,
      totalBudget: formData.totalBudget,
      currency: formData.currency,
      preferences: {
        vibe: formData.vibe,
        priorities: formData.priorities,
        dietaryNotes: formData.dietaryNotes,
        accessibilityNeeds: formData.accessibilityNeeds,
        constraints: formData.constraints,
      },
    },
    summary: aiData.summary || `Personalized event master plan for ${formData.title}.`,
    assumptions: aiData.assumptions || [
      'Estimates based on regional market averages.',
      'Contingency buffer reserved for unexpected logistics.',
    ],
    themeConcept: {
      title: aiData.themeConcept?.title || 'Celebration Essence',
      description: aiData.themeConcept?.description || 'A thoughtfully styled aesthetic experience.',
      colorPalette: aiData.themeConcept?.colorPalette || [
        { name: 'Terracotta', hex: '#C2410C' },
        { name: 'Warm Amber', hex: '#F59E0B' },
        { name: 'Deep Espresso', hex: '#261C16' },
      ],
      keywords: aiData.themeConcept?.keywords || ['Celebration', 'Memorable', 'Harmonious'],
    },
    budget: {
      totalBudget: formData.totalBudget,
      currency: formData.currency,
      items: budgetItems,
    },
    timeline: timeline.length > 0 ? timeline : generateDefaultTimeline(formData.eventType),
    runOfShow: runOfShow.length > 0 ? runOfShow : generateDefaultRunOfShow(formData.eventType),
    vendors: vendors.length > 0 ? vendors : generateDefaultVendors(formData.eventType),
    ideas: aiData.personalizedIdeas || {
      activities: [{ title: 'Welcome Icebreaker', description: 'Fun guest connection kickoff', estimatedCost: '$0' }],
      foodAndBeverage: [{ title: 'Signature Refreshment', description: 'Curated drink pairing' }],
      decorAndAtmosphere: [{ title: 'Ambient Lighting', description: 'Warm incandescent mood glow' }],
      diyHacks: ['Combine decor pieces across multiple focal tables to optimize budget.'],
    },
  };
}

/**
 * Smart Deterministic Fallback Generator
 * Generates tailored plans instantly when no API key is provided
 */
export function generateDeterministicPlan(formData: OnboardingFormValues): EventPlan {
  const budgetItems = generateDeterministicBudget(formData.eventType, formData.totalBudget);

  const themePresets: Record<string, any> = {
    wedding: {
      title: 'Warm Terracotta & Champagne Flora',
      description: 'Earthy terracotta and warm ochre accented with subtle champagne gold and lush greenery for timeless warmth.',
      colorPalette: [
        { name: 'Terracotta Rust', hex: '#C2410C' },
        { name: 'Warm Amber', hex: '#F59E0B' },
        { name: 'Spiced Ochre', hex: '#EA580C' },
        { name: 'Champagne Silk', hex: '#FEF3C7' },
        { name: 'Deep Espresso', hex: '#261C16' },
      ],
      keywords: ['Botanical Glasshouse', 'Candlelit Tablescapes', 'Acoustic Harmonies', 'Warm Hospitality'],
    },
    birthday: {
      title: 'Vibrant Amber & Neon Glow',
      description: 'High-energy celebration palette featuring radiant oranges, electric golds, and deep espresso contrast.',
      colorPalette: [
        { name: 'Electric Orange', hex: '#EA580C' },
        { name: 'Warm Amber', hex: '#F59E0B' },
        { name: 'Honey Glow', hex: '#F97316' },
        { name: 'Vanilla Cream', hex: '#FFFBEB' },
        { name: 'Dark Slate', hex: '#1E293B' },
      ],
      keywords: ['Interactive Challenges', 'Photo Memory Wall', 'Custom Dessert Bar', 'Upbeat Sound'],
    },
    community: {
      title: 'Rustic Harvest & Sunlit Earth',
      description: 'Welcoming community palette drawing from warm autumn harvest tones, timber wood, and fresh nature.',
      colorPalette: [
        { name: 'Warm Terracotta', hex: '#C2410C' },
        { name: 'Harvest Pumpkin', hex: '#EA580C' },
        { name: 'Golden Honey', hex: '#D97706' },
        { name: 'Forest Moss', hex: '#365314' },
        { name: 'Kraft Brown', hex: '#78350F' },
      ],
      keywords: ['Zero Waste Spirit', 'Volunteer Energy', 'Family Friendly', 'Local Harmony'],
    },
  };

  const currentTheme = themePresets[formData.eventType] || themePresets.wedding;

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    basics: {
      eventType: formData.eventType,
      title: formData.title,
      dateType: formData.dateType,
      eventDate: formData.eventDate,
      guestCount: formData.guestCount,
      location: formData.location || 'Local Venue',
      totalBudget: formData.totalBudget,
      currency: formData.currency,
      preferences: {
        vibe: formData.vibe || 'Warm, elegant and memorable',
        priorities: formData.priorities.length > 0 ? formData.priorities : ['Hospitality', 'Atmosphere', 'Memories'],
        dietaryNotes: formData.dietaryNotes || 'Crowd-pleasing dietary accommodations',
        accessibilityNeeds: formData.accessibilityNeeds || 'Accessible entrance and clear pathways',
        constraints: formData.constraints || 'Standard venue hours',
      },
    },
    summary: `A meticulously planned ${formData.eventType} celebration for ${formData.guestCount} guests, prioritizing ${
      formData.priorities.slice(0, 2).join(' and ') || 'an unforgettable experience'
    } within a ${formData.currency} ${formData.totalBudget.toLocaleString()} budget.`,
    assumptions: [
      'Venue booking includes standard tables and chairs.',
      'Contingency reserve covers unexpected supply adjustments and gratuities.',
      'Timeline milestones designed to minimize stress and prevent last-minute rushes.',
    ],
    themeConcept: currentTheme,
    budget: {
      totalBudget: formData.totalBudget,
      currency: formData.currency,
      items: budgetItems,
    },
    timeline: generateDefaultTimeline(formData.eventType),
    runOfShow: generateDefaultRunOfShow(formData.eventType),
    vendors: generateDefaultVendors(formData.eventType),
    ideas: generateDefaultIdeas(formData.eventType, formData.vibe),
  };
}

function generateDefaultTimeline(eventType: string) {
  if (eventType === 'wedding') {
    return [
      {
        id: 't-1',
        period: '6-9 Months Before',
        tasks: [
          { id: 't-101', title: 'Tour and secure ceremony & reception venue', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 't-102', title: 'Book wedding photographer and videographer', completed: false, category: 'Creative', priority: 'High' as const },
          { id: 't-103', title: 'Schedule menu tasting with preferred caterer', completed: false, category: 'Payment', priority: 'Medium' as const },
        ],
      },
      {
        id: 't-2',
        period: '2-4 Months Before',
        tasks: [
          { id: 't-201', title: 'Send formal invitations with digital RSVP link', completed: false, category: 'Guest Coordination', priority: 'High' as const },
          { id: 't-202', title: 'Finalize floral arrangements & color scheme swatches', completed: false, category: 'Creative', priority: 'Medium' as const },
          { id: 't-203', title: 'Curate must-play playlist and special dance tracks', completed: false, category: 'Creative', priority: 'Medium' as const },
        ],
      },
      {
        id: 't-3',
        period: 'Week of Event',
        tasks: [
          { id: 't-301', title: 'Submit final guest count and dietary breakdown to caterer', completed: false, category: 'Guest Coordination', priority: 'High' as const },
          { id: 't-302', title: 'Conduct rehearsal walkthrough and ceremony review', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 't-303', title: 'Prepare vendor tip envelopes and balance payments', completed: false, category: 'Payment', priority: 'High' as const },
        ],
      },
    ];
  } else if (eventType === 'birthday') {
    return [
      {
        id: 't-1',
        period: '3-4 Weeks Prior',
        tasks: [
          { id: 'tb-101', title: 'Reserve venue space or outdoor park shelter', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 'tb-102', title: 'Send digital animated invitations with RSVP deadline', completed: false, category: 'Guest Coordination', priority: 'High' as const },
        ],
      },
      {
        id: 't-2',
        period: '1-2 Weeks Prior',
        tasks: [
          { id: 'tb-201', title: 'Order custom theme cake or specialty cupcakes', completed: false, category: 'Payment', priority: 'High' as const },
          { id: 'tb-202', title: 'Purchase game supplies, prizes, and party favors', completed: false, category: 'Creative', priority: 'Medium' as const },
        ],
      },
      {
        id: 't-3',
        period: 'Day of Celebration',
        tasks: [
          { id: 'tb-301', title: 'Pick up bakery order and chill beverages', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 'tb-302', title: 'Set up welcome banner, balloon arch, and game stations', completed: false, category: 'Creative', priority: 'High' as const },
        ],
      },
    ];
  } else {
    return [
      {
        id: 't-1',
        period: '6-8 Weeks Before',
        tasks: [
          { id: 'tc-101', title: 'Obtain city park permit and event liability insurance', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 'tc-102', title: 'Recruit neighborhood volunteer leads and captains', completed: false, category: 'Guest Coordination', priority: 'High' as const },
        ],
      },
      {
        id: 't-2',
        period: '2-3 Weeks Before',
        tasks: [
          { id: 'tc-201', title: 'Confirm equipment rentals (sound system, tents, tables)', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 'tc-202', title: 'Distribute posters, flyers, and digital community notices', completed: false, category: 'Creative', priority: 'Medium' as const },
        ],
      },
      {
        id: 't-3',
        period: 'Day of Event',
        tasks: [
          { id: 'tc-301', title: 'Morning volunteer check-in and zone briefing', completed: false, category: 'Logistics', priority: 'High' as const },
          { id: 'tc-302', title: 'Post-event cleanup sweep and zero-waste disposal', completed: false, category: 'Logistics', priority: 'High' as const },
        ],
      },
    ];
  }
}

function generateDefaultRunOfShow(eventType: string) {
  if (eventType === 'wedding') {
    return [
      { id: 'ros-1', time: '10:00 AM', activity: 'Hair & makeup prep and getting-ready photography', owner: 'Bridal Party', location: 'Bridal Suite' },
      { id: 'ros-2', time: '02:00 PM', activity: 'Couple first look and family portraits', owner: 'Photographer', location: 'Garden Courtyard' },
      { id: 'ros-3', time: '04:30 PM', activity: 'Guest arrival with welcome spiced refreshments', owner: 'Greeters', location: 'Main Lawn' },
      { id: 'ros-4', time: '05:00 PM', activity: 'Ceremony begins', owner: 'Officiant', location: 'Ceremony Altar' },
      { id: 'ros-5', time: '06:00 PM', activity: 'Cocktail hour with passed hors d’oeuvres', owner: 'Catering Lead', location: 'Veranda' },
      { id: 'ros-6', time: '07:15 PM', activity: 'Grand entrance & dinner service', owner: 'Emcee / DJ', location: 'Ballroom' },
      { id: 'ros-7', time: '09:00 PM', activity: 'Cake cutting followed by open dance party', owner: 'DJ', location: 'Dance Floor' },
      { id: 'ros-8', time: '10:45 PM', activity: 'Sparkler grand send-off tunnel', owner: 'Coordinator', location: 'Front Plaza' },
    ];
  } else if (eventType === 'birthday') {
    return [
      { id: 'ros-1', time: '01:00 PM', activity: 'Room decoration, balloon staging, and snack tables', owner: 'Hosts', location: 'Main Hall' },
      { id: 'ros-2', time: '02:00 PM', activity: 'Guest arrival & icebreaker game challenge', owner: 'Host', location: 'Welcome Area' },
      { id: 'ros-3', time: '02:45 PM', activity: 'Main interactive activity or performer show', owner: 'Performer', location: 'Activity Center' },
      { id: 'ros-4', time: '03:45 PM', activity: 'Food, pizza, and refreshments buffet', owner: 'Helpers', location: 'Dining Tables' },
      { id: 'ros-5', time: '04:20 PM', activity: 'Birthday song, blowing candles, cake service', owner: 'Family', location: 'Stage' },
      { id: 'ros-6', time: '04:50 PM', activity: 'Favor bag distribution & goodbyes', owner: 'Host', location: 'Exit Door' },
    ];
  } else {
    return [
      { id: 'ros-1', time: '08:00 AM', activity: 'Organizers arrive, set up tents and sound gear', owner: 'Lead Coordinator', location: 'Central Pavilion' },
      { id: 'ros-2', time: '09:00 AM', activity: 'Community check-in, name tags, and opening remarks', owner: 'Welcome Team', location: 'Information Booth' },
      { id: 'ros-3', time: '10:00 AM', activity: 'Morning main event / volunteer activity blocks', owner: 'Group Leads', location: 'Activity Zones' },
      { id: 'ros-4', time: '12:30 PM', activity: 'Community potluck / hot meal service and music', owner: 'Hospitality Crew', location: 'Food Pavilion' },
      { id: 'ros-5', time: '02:30 PM', activity: 'Closing announcements and raffle drawings', owner: 'MC', location: 'Stage' },
      { id: 'ros-6', time: '03:30 PM', activity: 'Pack-down, waste sorting, and park handoff', owner: 'All Volunteers', location: 'Entire Grounds' },
    ];
  }
}

function generateDefaultVendors(eventType: string) {
  if (eventType === 'wedding') {
    return [
      {
        id: 'v-1',
        service: 'Reception & Ceremony Venue',
        urgency: 'Immediate' as const,
        status: 'to_research' as const,
        targetLeadTime: '9-12 months prior',
        recommendedBudgetRange: '40% - 45% of total budget',
        questions: [
          'What is your cancellation and date postponement policy?',
          'Are tables, chairs, and standard linens included in the venue rental?',
          'What are the sound curfew and alcohol licensing restrictions?',
        ],
      },
      {
        id: 'v-2',
        service: 'Professional Wedding Photographer',
        urgency: 'Immediate' as const,
        status: 'to_research' as const,
        targetLeadTime: '6-9 months prior',
        recommendedBudgetRange: '12% - 15% of total budget',
        questions: [
          'How many hours of coverage are included and do you bring a second shooter?',
          'What is the turnaround time for the full edited high-res digital gallery?',
          'Have you shot at our venue or in similar ambient lighting conditions?',
        ],
      },
      {
        id: 'v-3',
        service: 'Catering & Beverage Team',
        urgency: 'Standard' as const,
        status: 'to_research' as const,
        targetLeadTime: '6-8 months prior',
        recommendedBudgetRange: 'Part of Venue & Catering allocation',
        questions: [
          'Can we schedule a private tasting before signing the contract?',
          'How do you accommodate severe allergies and vegan/vegetarian guests?',
          'What is your server and bartender staffing ratio per 50 guests?',
        ],
      },
    ];
  } else if (eventType === 'birthday') {
    return [
      {
        id: 'v-1',
        service: 'Specialty Theme Bakery',
        urgency: 'Standard' as const,
        status: 'to_research' as const,
        targetLeadTime: '2-3 weeks prior',
        recommendedBudgetRange: '$60 - $120',
        questions: [
          'Can you match the color palette and character theme precisely?',
          'Are there certified nut-free or gluten-free options available?',
          'Does the cake come with a sturdy transport box and handling guide?',
        ],
      },
      {
        id: 'v-2',
        service: 'Party Entertainment or Game Host',
        urgency: 'Standard' as const,
        status: 'to_research' as const,
        targetLeadTime: '3-4 weeks prior',
        recommendedBudgetRange: '$100 - $250',
        questions: [
          'What age groups are your interactive games tailored for?',
          'Do you supply all the props, music, and prizes needed for the activities?',
          'What happens in case of performer illness or emergency backup?',
        ],
      },
    ];
  } else {
    return [
      {
        id: 'v-1',
        service: 'Parks Department / Permitting Office',
        urgency: 'Immediate' as const,
        status: 'to_research' as const,
        targetLeadTime: '6-8 weeks prior',
        recommendedBudgetRange: '$100 - $300',
        questions: [
          'Are amplified sound and generator permits included in the park reservation?',
          'What are the municipal waste disposal requirements for public gatherings?',
          'Is commercial general liability insurance mandatory for our group size?',
        ],
      },
      {
        id: 'v-2',
        service: 'Equipment & Tent Rentals',
        urgency: 'Standard' as const,
        status: 'to_research' as const,
        targetLeadTime: '3-4 weeks prior',
        recommendedBudgetRange: '$200 - $500',
        questions: [
          'Do you provide delivery, setup, and teardown services in the quote?',
          'Can pop-up tents be anchored with water barrels/weights instead of ground stakes?',
          'What is the emergency weather cancellation deadline?',
        ],
      },
    ];
  }
}

function generateDefaultIdeas(eventType: string, vibe: string) {
  return {
    activities: [
      {
        title: 'Interactive Audio Guestbook or Memory Wall',
        description: 'Provide an engaging station where guests write notes or record heartfelt audio messages for the hosts.',
        estimatedCost: '$50 - $150',
      },
      {
        title: 'Curated Icebreaker Trivia Challenge',
        description: 'Personalized multi-choice trivia questions on cards or phones connecting guests and sparking laughs.',
        estimatedCost: '$20 supplies',
      },
    ],
    foodAndBeverage: [
      {
        title: 'Signature Spiced Citrus Spritz',
        description: 'Sparkling blood orange and rosemary infused beverage (cocktail or mocktail) matching the warm aesthetic.',
      },
      {
        title: 'Bite-Sized Artisan Savory Sliders',
        description: 'Comforting, easily portable gourmet sliders with vegetarian portobello and grilled chicken options.',
      },
    ],
    decorAndAtmosphere: [
      {
        title: 'Warm Amber Filament & Fairy Lighting',
        description: 'Warm 2400K incandescent bulbs and soft amber uplighting along walls to create an inviting, glowing sanctuary.',
      },
      {
        title: 'Terracotta Ceramic Accents & Pampas Grass',
        description: 'Minimalist ceramic vases with textured dried grasses and warm amber votive candles.',
      },
    ],
    diyHacks: [
      'Create QR-code menu and program cards printed on textured cardstock to save up to $300 in printing costs.',
      'Group small pillar candles in varied glass cylinders to create high-impact centerpieces at a fraction of floral costs.',
      'Repurpose focal ceremony decorations as buffet or sweetheart table backdrops during the reception.',
    ],
  };
}

/**
 * Direct call to OpenRouter or Google Gemini for multi-turn Copilot Conversation & Inquiries
 */
async function callAiConversationalConcierge(
  currentPlan: EventPlan,
  userPrompt: string,
  apiKey: string
): Promise<{ reply: string; patchAction?: any }> {
  const isOpenRouter = isOpenRouterKey(apiKey);

  const budgetSummary = currentPlan.budget.items
    .map(
      (i) =>
        `- ${i.category}: ${currentPlan.basics.currency} ${i.allocatedAmount.toLocaleString()} (${i.percentage}%)${i.notes ? ` - ${i.notes}` : ''}`
    )
    .join('\n');

  const timelineSummary = currentPlan.timeline
    .map((t) => `- ${t.period}: ${t.tasks.map((k) => k.title).join(', ')}`)
    .join('\n');

  const systemPrompt = `You are Planora's AI Master Event Planning Copilot and Personal Concierge.
You possess deep, practical expertise in organizing memorable weddings, milestone birthdays, and community celebrations.
You are actively consulting for this specific event:
• Title: "${currentPlan.basics.title}" (${currentPlan.basics.eventType.toUpperCase()})
• Timeline / Date: ${currentPlan.basics.eventDate || 'Flexible / Undecided'}
• Guest Count: ${currentPlan.basics.guestCount} attendees
• Total Budget: ${currentPlan.basics.currency} ${currentPlan.budget.totalBudget.toLocaleString()}
• Venue / Location: ${currentPlan.basics.location}
• Desired Vibe: ${currentPlan.basics.preferences.vibe}
• Stated Priorities: ${currentPlan.basics.preferences.priorities.join(', ') || 'Overall guest satisfaction'}
• Dietary & Allergen Notes: ${currentPlan.basics.preferences.dietaryNotes || 'Standard crowd-pleasing options'}
• Accessibility & Constraints: ${currentPlan.basics.preferences.accessibilityNeeds || 'None'} / ${currentPlan.basics.preferences.constraints || 'Standard venue hours'}

Current Budget Allocations:
${budgetSummary}

Current Roadmap Phases:
${timelineSummary}

INSTRUCTIONS:
1. Provide thoughtful, warm, realistic, and highly practical answers to ANY event question the user asks:
   - Vendor questions (sharp questions to ask, what to watch for in contracts, tipping norms)
   - Day-of run of show sequencing (photo timing, cocktail hour, toasts, cake cutting, transitions)
   - Budget optimization (where to save without losing impact, DIY hacks, cost reallocation)
   - Themes, styling, aesthetic color palettes, lighting, and decor
   - Menu curation, signature drinks, food station ideas, allergy safety
   - Entertainment, music playlists, guest icebreakers, activities, party games
   - Scenario stress testing (e.g. sudden rain, guest surges, budget cuts)
2. Use clear, organized markdown with bullet points, numbered lists, and bold headings. Avoid generic fluff.
3. If the user asks to modify their plan (e.g. adjust budget, change guest count, make venue free, change dietary notes), formulate your helpful explanation and append a structured JSON patch block at the very end formatted as:
\`\`\`json
{
  "patchAction": {
    "type": "apply_budget" | "update_theme",
    "label": "Button Label (e.g. Apply +25 Guests & Adjust Food Budget)",
    "data": {
      // For apply_budget: guestCount?, totalBudget?, categoryToBoost?, amountToAdd?, cutAmount?, reallocateFreeVenue?, freedAmount?
      // For update_theme: dietaryShift?
    }
  }
}
\`\`\`
`;

  let rawResponseText = '';

  if (isOpenRouter) {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173/',
        'X-Title': 'Planora Event Planner',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter returned status ${res.status}`);
    }
    const data = await res.json();
    rawResponseText = data.choices?.[0]?.message?.content || '';
  } else {
    // Google Gemini Direct
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1500,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini returned status ${res.status}`);
    }
    const data = await res.json();
    rawResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  // Parse any embedded patchAction block
  let patchAction: any = undefined;
  let cleanReply = rawResponseText;

  const jsonMatch = rawResponseText.match(/```(?:json)?\s*(\{[\s\S]*?"patchAction"[\s\S]*?\})\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.patchAction) {
        patchAction = parsed.patchAction;
        cleanReply = rawResponseText.replace(jsonMatch[0], '').trim();
      }
    } catch {
      // Ignore JSON parse error, keep full text
    }
  }

  return {
    reply: cleanReply,
    patchAction,
  };
}

/**
 * Handle AI Copilot Natural Language Inquiries and "What-If" Simulations
 */
export async function simulateWhatIfScenario(
  currentPlan: EventPlan,
  userPrompt: string
): Promise<{ reply: string; patchAction?: any }> {
  // 1. Try Live AI Concierge first (OpenRouter / Gemini)
  const apiKey = getStoredApiKey();
  if (apiKey) {
    try {
      const liveRes = await callAiConversationalConcierge(currentPlan, userPrompt, apiKey);
      if (liveRes.reply && liveRes.reply.trim().length > 0) {
        return liveRes;
      }
    } catch (err) {
      console.warn('Live AI Copilot call error, falling back to smart local heuristic:', err);
    }
  }

  // 2. High-Fidelity Local Deterministic & Heuristic Fallback
  const lower = userPrompt.toLowerCase();

  // Scenario 1: Guest count shift (+30% or count increase)
  if (lower.includes('+30%') || lower.includes('30%') || lower.includes('more people') || lower.includes('guests increase')) {
    const newCount = Math.round(currentPlan.basics.guestCount * 1.3);
    const addedCount = newCount - currentPlan.basics.guestCount;
    const foodCat = currentPlan.budget.items.find((i) => i.category.toLowerCase().includes('food') || i.category.toLowerCase().includes('catering'));
    const estFoodDelta = addedCount * 45;

    return {
      reply: `Increasing guest count from **${currentPlan.basics.guestCount} to ${newCount} (+${addedCount} guests)** primarily affects Catering & Food service. At an estimated $45/head, your catering line item should increase by approximately **${currentPlan.basics.currency} ${estFoodDelta.toLocaleString()}**. We can offset this by tapping into your Contingency Reserve or adjusting Decor.`,
      patchAction: {
        type: 'apply_budget',
        label: `Update Guest Count to ${newCount} & Adjust Food Budget`,
        data: {
          guestCount: newCount,
          categoryToBoost: foodCat ? foodCat.category : 'Venue & Catering',
          amountToAdd: estFoodDelta,
        },
      },
    };
  }

  // Scenario 2: Budget reduction
  if (lower.includes('decrease by') || lower.includes('cut') || lower.includes('lower budget') || lower.includes('reduce')) {
    const cutAmount = Math.min(1000, Math.round(currentPlan.basics.totalBudget * 0.1));
    const newTotal = currentPlan.basics.totalBudget - cutAmount;

    return {
      reply: `To decrease your total budget by **${currentPlan.basics.currency} ${cutAmount.toLocaleString()}** (to ${currentPlan.basics.currency} ${newTotal.toLocaleString()}), the safest strategy is reducing Decor & Florals by 40% (shifting to DIY/candlelight) and scaling back Stationery and Contingency without touching Core Venue and Food quality.`,
      patchAction: {
        type: 'apply_budget',
        label: `Apply -${currentPlan.basics.currency} ${cutAmount.toLocaleString()} Budget Optimization`,
        data: {
          totalBudget: newTotal,
          cutAmount,
        },
      },
    };
  }

  // Scenario 3: Venue is free
  if (lower.includes('venue is free') || lower.includes('free park') || lower.includes('park venue')) {
    const venueCat = currentPlan.budget.items.find((i) => i.category.toLowerCase().includes('venue'));
    const freedAmount = venueCat ? Math.round(venueCat.allocatedAmount * 0.7) : 1500;

    return {
      reply: `🎉 Great news! Having a free venue unlocks approximately **${currentPlan.basics.currency} ${freedAmount.toLocaleString()}** in your budget! I recommend reallocating:
- **50% (${currentPlan.basics.currency} ${Math.round(freedAmount * 0.5).toLocaleString()})** to Elevated Catering & Signature Drinks
- **30% (${currentPlan.basics.currency} ${Math.round(freedAmount * 0.3).toLocaleString()})** to Live Entertainment & Sound
- **20% (${currentPlan.basics.currency} ${Math.round(freedAmount * 0.2).toLocaleString()})** to your Contingency Reserve for park permits and portable comforts.`,
      patchAction: {
        type: 'apply_budget',
        label: `Reallocate Free Venue Savings (${currentPlan.basics.currency} ${freedAmount.toLocaleString()})`,
        data: {
          reallocateFreeVenue: true,
          freedAmount,
        },
      },
    };
  }

  // Scenario 4: Vegan or Dietary shift
  if (lower.includes('vegan') || lower.includes('gluten') || lower.includes('dietary')) {
    return {
      reply: `Adopting a 100% plant-based / dietary-inclusive menu can actually save 12-18% on food sourcing while delighting guests with vibrant flavors! Here are 3 crowd-pleasing pairings:
1. **Smoked Butternut Squash Risotto** with crispy sage and toasted pine nuts.
2. **Wild Mushroom & Truffle Crostini** with rosemary garlic drizzle.
3. **Pistachio Cardamom Mini Tarts** with coconut whipped cream.`,
      patchAction: {
        type: 'update_theme',
        label: 'Add Plant-Based Menu & Dietary Notes to Ideas',
        data: {
          dietaryShift: '100% Plant-Based & Allergen Conscious',
        },
      },
    };
  }

  // Scenario 5: Vendor questions
  if (lower.includes('vendor') || lower.includes('question') || lower.includes('interview') || lower.includes('contract')) {
    return {
      reply: `Here are the top 4 essential questions to ask your prospective vendors for "${currentPlan.basics.title}":
1. **Overtime & Teardown Rates:** "What is the hourly surcharge if setup or teardown runs 45 minutes beyond schedule?"
2. **Backup & Contingency:** "Do you have an insured backup professional if emergency sickness strikes on the day?"
3. **Deliverables Timeline:** "What is the exact contractually guaranteed turnaround time for final files / teardown?"
4. **Deposit Refund Terms:** "What is your refund policy if date changes become necessary due to unforeseen circumstances?"`,
    };
  }

  // Scenario 6: Timeline & Day-of run of show
  if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('run of show') || lower.includes('timing')) {
    return {
      reply: `Here is a golden timing framework for "${currentPlan.basics.title}":
• **T-Minus 3 Hours:** Vendor setup & sound checks commence.
• **T-Minus 30 Mins:** Background music active, guest welcome drinks ready.
• **Hour 0.0:** Welcome & official ceremony or kickoff activity.
• **Hour 1.0 - 2.5:** Food service, dining, and toasts/speeches.
• **Hour 2.5 - 4.0:** High-energy entertainment, interactive games, and dancing.
• **Final 30 Mins:** Thank you farewell, takeaway favors, and coordinated teardown.`,
    };
  }

  // Scenario 7: Games & Entertainment
  if (lower.includes('game') || lower.includes('activity') || lower.includes('icebreaker') || lower.includes('entertainment')) {
    return {
      reply: `Engaging activities tailored for ${currentPlan.basics.guestCount} guests at your ${currentPlan.basics.eventType}:
1. **Personalized Table Trivia:** 5 fun questions about the hosts or theme printed on kraft cardstock at every table.
2. **Audio Guestbook / Memory Corner:** A vintage telephone or tablet where guests record 30-second memories.
3. **Golden Hour Photo Challenge:** A mini scavenger hunt where guests snap candid moments with designated hashtags.`,
    };
  }

  // General Copilot Response
  return {
    reply: `Planora AI Copilot here! For "${currentPlan.basics.title}", I'm ready to help you with:
- **Vendor Negotiation & Questions:** Ask me for specific questions to ask caterers, DJs, or photographers.
- **Run of Show Sequencing:** Ask me how to pace toasts, cake cutting, or cocktail hours.
- **Budget Adjustments:** Ask me to test cost-cutting tactics or reallocation.
- **Creative Styling & Menus:** Ask me for cocktail pairings, color swatches, or DIY decor ideas!`,
  };
}

/**
 * Generate AI Digital Invitations, Speeches & Vendor Negotiation Letters (Phase 7)
 */
export async function generateAiCelebrationDocument(
  plan: EventPlan,
  docType: 'invitation' | 'speech' | 'vendor_email',
  options: {
    tone?: string;
    speechRole?: string;
    vendorService?: string;
    specialNotes?: string;
  }
): Promise<string> {
  const apiKey = getStoredApiKey();

  let prompt = '';
  if (docType === 'invitation') {
    prompt = `You are Planora's master celebration copywriter. 
Write a complete, beautifully worded digital invitation text (formatted for WhatsApp, SMS, or Paperless Post) for:
- Event: ${plan.basics.title} (${plan.basics.eventType.toUpperCase()})
- Target Date: ${plan.basics.eventDate || 'Date to be announced'}
- Location: ${plan.basics.location || 'Local Venue'}
- Guest Count: ${plan.basics.guestCount}
- Aesthetic & Vibe: ${plan.basics.preferences.vibe}
- Writing Tone: ${options.tone || 'Warm, Heartfelt & Celebratory'}
- Special Instructions / Dress Code: ${options.specialNotes || 'Festive celebration attire'}

Provide:
1. Catchy headline with tasteful celebratory emojis
2. Warm invitation body setting the mood
3. Date, Time, Venue, and Dress Code details
4. RSVP deadline and dietary instructions placeholder [Insert RSVP Link]`;
  } else if (docType === 'speech') {
    prompt = `You are a world-class speechwriter and toastmaster.
Write an emotional, charismatic, and memorable speech for:
- Event: ${plan.basics.title}
- Speaker Role: ${options.speechRole || 'Host Welcome Speech'}
- Writing Tone: ${options.tone || 'Warm & Heartfelt'}
- Event Vibe: ${plan.basics.preferences.vibe}
- Special Stories / Inside Memories to weave in: ${options.specialNotes || 'Cherished friendship and milestones'}

Structure the speech clearly:
1. Warm, magnetic opening icebreaker hook
2. 2-3 genuine, vivid storytelling moments
3. Sincere gratitude to everyone who traveled and supported the hosts
4. A memorable, goosebump-worthy closing toast where everyone raises their glasses!`;
  } else {
    // vendor_email
    prompt = `You are a professional event producer and contract negotiator.
Write a polite, highly persuasive, and organized quote inquiry email for:
- Event: ${plan.basics.title} (${plan.basics.eventType})
- Vendor Service: ${options.vendorService || 'Event Services'}
- Event Date: ${plan.basics.eventDate || 'Flexible timeline'}
- Location: ${plan.basics.location || 'Local Venue'}
- Guest Count: ${plan.basics.guestCount} attendees
- Budget Target: Approx ${plan.basics.currency} ${
      plan.budget.items.find((i) => i.category.toLowerCase().includes(options.vendorService?.toLowerCase() || ''))
        ?.allocatedAmount || 2000
    }
- Custom Inquiries: ${options.specialNotes || 'Standard comprehensive package'}

Include:
- Polite greeting and expression of admiration for their work
- Clear event snapshot (Date, Location, Headcount)
- Specific questions about package inclusions, overtime fees, and deposit schedules
- Polite inquiry about availability for an introductory 15-minute consultation`;
  }

  // 1. Try Live Call if Key Available
  if (apiKey) {
    try {
      if (isOpenRouterKey(apiKey)) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173/',
            'X-Title': 'Planora Event Planner',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            max_tokens: 1500,
            messages: [
              {
                role: 'system',
                content:
                  'You are Planora, an expert AI celebration copywriter. Generate the requested document formatted with clean headings and spacing. Do not include markdown code ticks.',
              },
              { role: 'user', content: prompt },
            ],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content && content.trim().length > 0) {
            return content.trim();
          }
        }
      } else {
        // Direct Gemini API
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content && content.trim().length > 0) {
            return content.trim();
          }
        }
      }
    } catch (err) {
      console.warn('AI document generation failed, using rich template fallback:', err);
    }
  }

  // 2. High-Fidelity Local Template Fallback
  if (docType === 'invitation') {
    return `✨ YOU'RE INVITED! ✨\n\nPlease join us for\n${plan.basics.title.toUpperCase()}\n\n📅 Date: ${plan.basics.eventDate || 'Save the Date!'}\n📍 Location: ${plan.basics.location || 'Local Venue'}\n🥂 Vibe: ${plan.basics.preferences.vibe}\n\nWe cannot wait to celebrate this special milestone together with delicious food, great music, and unforgettable memories.\n\nDress Code: Festive & Celebratory\nRSVP Deadline: Please confirm your attendance by tapping the link below:\n👉 [https://planora.events/rsvp/${plan.id}]\n\nPlease mention any dietary requirements (vegan, halal, allergies) with your response so we can prepare our caterer!`;
  } else if (docType === 'speech') {
    return `"${plan.basics.title}" — Welcome Toast\n\n"Good evening, everyone! Look around this room. When we first started imagining this celebration for ${plan.basics.guestCount} of our favorite people, this exact feeling is what we hoped for.\n\nFrom the very beginning, our goal wasn't just to plan an event—it was to create an atmosphere of ${plan.basics.preferences.vibe}. A space where old friends reunite, new connections are sparked, and every memory feels timeless.\n\nTo everyone who traveled near and far to be here with us: your presence means more than words can say. To the amazing family, friends, and partners who helped bring this vision to life—thank you from the bottom of our hearts.\n\nSo please, keep your glasses charged, leave your worries at the door, and let's make tonight truly unforgettable.\n\nTo love, friendship, and the adventures ahead—Cheers!" 🥂`;
  } else {
    return `Subject: Inquiry: Availability & Pricing for ${plan.basics.title} (${plan.basics.eventDate || 'Upcoming'})\n\nDear ${options.vendorService || 'Events'} Team,\n\nI hope this email finds you well! I have been admiring your work and would love to inquire about your availability for an upcoming celebration.\n\nHere is an overview of our event:\n• Event: ${plan.basics.title} (${plan.basics.eventType})\n• Date: ${plan.basics.eventDate || 'Flexible / In Discussion'}\n• Location: ${plan.basics.location || 'Local Area'}\n• Estimated Guest Count: ${plan.basics.guestCount} attendees\n• Allocated Budget: Approx ${plan.basics.currency} ${
      plan.budget.items.find((i) => i.category.toLowerCase().includes(options.vendorService?.toLowerCase() || ''))
        ?.allocatedAmount || 2500
    }\n\nCould you please share your standard package inclusions, turnaround times, and contract deposit requirements? If you are available, I would love to schedule a brief 15-minute introductory call this week.\n\nThank you for your time, and I look forward to hearing from you!\n\nWarm regards,\nEvent Planning Team`;
  }
}

