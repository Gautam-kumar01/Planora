// Planora Data Models & Type Definitions based on PRD Section 5 & 6

export type EventType = 'wedding' | 'birthday' | 'community';

export type DateType = 'exact' | 'approximate' | 'undecided';

export type Priority = 'High' | 'Medium' | 'Low';

export type VendorStatus = 'to_research' | 'contacted' | 'quote_received' | 'booked' | 'not_needed';

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ThemeConcept {
  title: string;
  description: string;
  colorPalette: ColorSwatch[];
  keywords: string[];
}

export interface BudgetItem {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  percentage: number;
  notes?: string;
  isContingency?: boolean;
}

export interface Budget {
  totalBudget: number;
  currency: string;
  items: BudgetItem[];
}

export type TaskCategory = 'Logistics' | 'Creative' | 'Payment' | 'Guest Coordination' | 'General' | (string & {});

export interface TaskItem {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
  category: TaskCategory;
  priority: Priority;
  suggestedOffset?: string;
}

export interface TimelineSection {
  id: string;
  period: string; // e.g. "3-4 Months Prior", "Week of Event", "Morning of Event"
  tasks: TaskItem[];
}

export interface HourlyRunOfShowItem {
  id: string;
  time: string; // e.g. "08:00 AM"
  activity: string;
  owner?: string;
  location?: string;
  notes?: string;
}

export interface VendorItem {
  id: string;
  service: string;
  urgency: 'Immediate' | 'Standard' | 'Flexible';
  status: VendorStatus;
  targetLeadTime: string; // e.g. "6-9 months early"
  recommendedBudgetRange: string; // e.g. "$2,500 - $3,500"
  notes?: string;
  contactName?: string;
  contactEmail?: string;
  questions: string[]; // Top 3 interview questions
  contractStatus?: 'needed' | 'reviewing' | 'signed' | 'completed';
  depositAmount?: number;
  depositDueDate?: string;
  balanceDueDate?: string;
  signedDate?: string;
}

export interface ActivityIdea {
  title: string;
  description: string;
  estimatedCost: string;
  ageGroup?: string;
}

export interface FoodAndBeverageIdea {
  title: string;
  description: string;
  dietaryTags?: string[];
}

export interface PersonalizedIdeas {
  activities: ActivityIdea[];
  foodAndBeverage: FoodAndBeverageIdea[];
  decorAndAtmosphere: {
    title: string;
    description: string;
  }[];
  diyHacks: string[];
}

export type RsvpStatus = 'attending' | 'pending' | 'declined';
export type DietaryType = 'None' | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Halal' | 'Kosher' | 'Nut Allergy' | 'Dairy-Free' | string;

export interface GuestItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group?: string;
  rsvpStatus: RsvpStatus;
  plusOnes: number;
  dietary: DietaryType;
  tableId?: string;
  notes?: string;
}

export interface TableItem {
  id: string;
  name: string;
  capacity: number;
  shape: 'round' | 'rectangle' | 'sweetheart';
  notes?: string;
}

export type PaymentMethod = 'credit_card' | 'wire_transfer' | 'cash' | 'check' | 'venmo_zelle' | 'other';
export type PaymentStatus = 'paid' | 'pending' | 'scheduled';

export interface ExpenseRecord {
  id: string;
  budgetItemId?: string;
  vendorName: string;
  category: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  receiptNumber?: string;
  notes?: string;
}

export interface EventPlan {
  id: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  basics: {
    eventType: EventType;
    title: string;
    dateType: DateType;
    eventDate?: string;
    guestCount: number;
    location?: string;
    totalBudget: number;
    currency: string;
    budgetStatus?: 'defined' | 'needs_help';
    budgetTier?: 'economy' | 'moderate' | 'premium' | 'luxury';
    venueSetting?: 'indoor' | 'outdoor' | 'hybrid' | 'undecided';
    preferences: {
      vibe: string;
      priorities: string[];
      dietaryNotes: string;
      accessibilityNeeds: string;
      constraints: string;
    };
  };
  summary: string;
  assumptions: string[];
  themeConcept: ThemeConcept;
  budget: Budget;
  timeline: TimelineSection[];
  runOfShow: HourlyRunOfShowItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdeas;
  guests?: GuestItem[];
  tables?: TableItem[];
  expenses?: ExpenseRecord[];
}

export interface OnboardingFormValues {
  eventType: EventType;
  title: string;
  dateType: DateType;
  eventDate: string;
  guestCount: number;
  location: string;
  totalBudget: number;
  currency: string;
  budgetStatus: 'defined' | 'needs_help';
  budgetTier: 'economy' | 'moderate' | 'premium' | 'luxury';
  venueSetting: 'indoor' | 'outdoor' | 'hybrid' | 'undecided';
  vibe: string;
  priorities: string[];
  dietaryNotes: string;
  accessibilityNeeds: string;
  constraints: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  patchAction?: {
    type: 'apply_budget' | 'add_tasks' | 'add_vendor' | 'update_theme';
    label: string;
    data: any;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export type CloudSyncStatus = 'synced' | 'saving' | 'offline' | 'guest';

export interface DatabaseConfig {
  databaseUrl: string;
  apiKey?: string;
  provider: 'supabase' | 'postgres' | 'custom' | 'none';
  connected: boolean;
}

