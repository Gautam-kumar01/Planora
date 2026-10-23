import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  Users,
  Sparkles,
  ArrowLeft,
  UserCheck,
  Megaphone,
} from 'lucide-react';
import {
  EventPlan,
  BudgetItem,
  TimelineSection,
  HourlyRunOfShowItem,
  VendorItem,
  PersonalizedIdeas,
  ThemeConcept,
  GuestItem,
  TableItem,
  OnboardingFormValues,
  UserProfile,
  ExpenseRecord,
} from './types';
import {
  loadSavedPlans,
  savePlans,
  getActivePlanId,
  setActivePlanId,
} from './utils/storage';
import { getCurrentUser, logoutUser } from './utils/cloudSync';
import { generateEventPlanWithAI } from './utils/geminiApi';
import { downloadCalendarICS } from './utils/calendarExport';
import { SAMPLE_WEDDING_PLAN } from './utils/sampleData';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { UserDashboard } from './components/UserDashboard';
import { EventHeader } from './components/EventHeader';
import { BudgetHub } from './components/BudgetHub';
import { ExpenseLedgerModal } from './components/ExpenseLedgerModal';
import { TimelineRoadmap } from './components/TimelineRoadmap';
import { VendorChecklist } from './components/VendorChecklist';
import { CreativeIdeas } from './components/CreativeIdeas';
import { GuestSeatingHub } from './components/GuestSeatingHub';
import { AiDocumentModal } from './components/AiDocumentModal';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { SetupWizard } from './components/SetupWizard';
import { ApiKeyModal } from './components/ApiKeyModal';
import { PlanManagerModal } from './components/PlanManagerModal';
import { AuthModal } from './components/AuthModal';
import { AiTransparencyModal } from './components/AiTransparencyModal';
import { ShareCollaborateModal } from './components/ShareCollaborateModal';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { WeatherContingencyModal } from './components/WeatherContingencyModal';
import { LiveEventDirectorModal } from './components/LiveEventDirectorModal';
import { Footer } from './components/Footer';
import { PrintView } from './components/PrintView';
import { NextBestStepCard } from './components/NextBestStepCard';
import { CommunityChecklistHub } from './components/CommunityChecklistHub';
import { ChangeImpactModal } from './components/ChangeImpactModal';
import { PlanConflictModal } from './components/PlanConflictModal';
import { IndianEventIntelligenceModal } from './components/IndianEventIntelligenceModal';

export function App() {
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [activePlanId, setActiveId] = useState<string>('');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'user-hub'>('home');
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline' | 'vendors' | 'ideas' | 'guests' | 'community'>('budget');

  // Modals & Drawers
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState(false);
  const [isPlanManagerOpen, setIsPlanManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiTransparencyOpen, setIsAiTransparencyOpen] = useState(false);
  const [isAiDocsOpen, setIsAiDocsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isExpenseLedgerOpen, setIsExpenseLedgerOpen] = useState(false);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [isLiveDirectorOpen, setIsLiveDirectorOpen] = useState(false);
  const [isChangeImpactOpen, setIsChangeImpactOpen] = useState(false);
  const [isConflictCheckerOpen, setIsConflictCheckerOpen] = useState(false);
  const [isIndianIntelligenceOpen, setIsIndianIntelligenceOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wizardInitialValues, setWizardInitialValues] = useState<Partial<OnboardingFormValues> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Authentication & Cloud State (Option C: Hybrid)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getCurrentUser());

  // Initialize from LocalStorage
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    const loaded = loadSavedPlans(user?.id);
    setPlans(loaded);
    const activeId = getActivePlanId(loaded);
    setActiveId(activeId);
    if (user) {
      setCurrentView('user-hub');
    }
  }, []);

  // Pro Keyboard Shortcuts (Cmd/Ctrl + K: Copilot, Cmd/Ctrl + N: New Event, Esc: Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        setIsWizardOpen(true);
      } else if (e.key === 'Escape') {
        setIsWizardOpen(false);
        setIsPlanManagerOpen(false);
        setIsAuthModalOpen(false);
        setIsApiKeyOpen(false);
        setIsAiTransparencyOpen(false);
        setIsAiDocsOpen(false);
        setIsShareModalOpen(false);
        setIsWhatIfModalOpen(false);
        setIsExpenseLedgerOpen(false);
        setIsWeatherModalOpen(false);
        setIsLiveDirectorOpen(false);
        setIsChangeImpactOpen(false);
        setIsConflictCheckerOpen(false);
        setIsCopilotOpen(false);
        setIsIndianIntelligenceOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get active plan object
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;

  // Switch Plan & Open Dashboard
  const handleSelectPlan = (id: string) => {
    setActiveId(id);
    setActivePlanId(id);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Loaded event workspace');
  };

  // Update Plan helper
  const updateActivePlan = (updatedFields: Partial<EventPlan>) => {
    if (!activePlan) return;
    const updatedPlan: EventPlan = {
      ...activePlan,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };
    const updatedList = plans.map((p) => (p.id === activePlan.id ? updatedPlan : p));
    setPlans(updatedList);
    savePlans(updatedList, currentUser?.id);
  };

  const handleApplyChangeImpactPlan = (updatedPlan: EventPlan) => {
    const updatedList = plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setPlans(updatedList);
    savePlans(updatedList, currentUser?.id);
    showToast('Applied confirmed changes to plan!');
  };

  // Rename Plan
  const handleRenamePlan = (id: string, newTitle: string) => {
    const updatedList = plans.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          basics: { ...p.basics, title: newTitle },
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    setPlans(updatedList);
    savePlans(updatedList, currentUser?.id);
    showToast(`Renamed plan to "${newTitle}"`);
  };

  // Duplicate Plan
  const handleDuplicatePlan = (id: string) => {
    const planToClone = plans.find((p) => p.id === id);
    if (!planToClone) return;

    const clonedPlan: EventPlan = {
      ...planToClone,
      id: `plan-clone-${Date.now()}`,
      userId: currentUser?.id,
      basics: {
        ...planToClone.basics,
        title: `${planToClone.basics.title} (Copy)`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [clonedPlan, ...plans];
    setPlans(updatedList);
    savePlans(updatedList, currentUser?.id);
    setActiveId(clonedPlan.id);
    setActivePlanId(clonedPlan.id);
    setCurrentView('dashboard');
    showToast(`Created duplicate of "${planToClone.basics.title}"`);
  };

  // Delete Plan (Priority 1.4)
  const handleDeletePlan = (id: string) => {
    const updatedList = plans.filter((p) => p.id !== id);
    if (updatedList.length === 0) {
      const freshStarter: EventPlan = {
        ...SAMPLE_WEDDING_PLAN,
        id: `plan-${Date.now()}`,
        userId: currentUser?.id,
        basics: {
          ...SAMPLE_WEDDING_PLAN.basics,
          title: 'My New Event Plan',
        },
      };
      setPlans([freshStarter]);
      savePlans([freshStarter], currentUser?.id);
      setActiveId(freshStarter.id);
      setActivePlanId(freshStarter.id);
      showToast('Plan deleted. Initialized fresh celebration draft.');
      return;
    }

    setPlans(updatedList);
    savePlans(updatedList, currentUser?.id);
    if (activePlanId === id) {
      setActiveId(updatedList[0].id);
      setActivePlanId(updatedList[0].id);
    }
    showToast('Plan deleted successfully.');
  };

  // Module Updates
  const handleUpdateBudget = (updatedItems: BudgetItem[], totalBudget?: number) => {
    if (!activePlan) return;
    const newTotal = totalBudget !== undefined ? totalBudget : activePlan.budget.totalBudget;
    updateActivePlan({
      budget: {
        ...activePlan.budget,
        totalBudget: newTotal,
        items: updatedItems,
      },
      basics: {
        ...activePlan.basics,
        totalBudget: newTotal,
      },
    });
  };

  const handleUpdateTimeline = (updatedTimeline: TimelineSection[], updatedRunOfShow?: HourlyRunOfShowItem[]) => {
    if (!activePlan) return;
    updateActivePlan({
      timeline: updatedTimeline,
      ...(updatedRunOfShow ? { runOfShow: updatedRunOfShow } : {}),
    });
  };

  // 1-Click Task Completion from Next Best Step Card
  const handleCompleteTaskFromNextStep = (sectionId: string, taskId: string) => {
    if (!activePlan) return;
    const updatedTimeline = activePlan.timeline.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
        };
      }
      return section;
    });
    updateActivePlan({ timeline: updatedTimeline });
    showToast('Task marked complete! Next step updated.');
  };

  const handleUpdateVendors = (updatedVendors: VendorItem[]) => {
    updateActivePlan({ vendors: updatedVendors });
  };

  const handleUpdateIdeas = (updatedIdeas: PersonalizedIdeas, updatedTheme?: ThemeConcept) => {
    if (!activePlan) return;
    updateActivePlan({
      ideas: updatedIdeas,
      ...(updatedTheme ? { themeConcept: updatedTheme } : {}),
    });
    showToast('Updated moodboard and creative inspirations');
  };

  const handleUpdateGuests = (updatedGuests: GuestItem[]) => {
    if (!activePlan) return;
    updateActivePlan({ guests: updatedGuests });
    showToast('Updated guest roster & RSVP statuses');
  };

  const handleUpdateTables = (updatedTables: TableItem[]) => {
    if (!activePlan) return;
    updateActivePlan({ tables: updatedTables });
    showToast('Updated table seating chart & assignments');
  };

  const handleUpdateExpenses = (updatedExpenses: ExpenseRecord[]) => {
    if (!activePlan) return;
    updateActivePlan({ expenses: updatedExpenses });
    showToast('Expense and payment ledger updated');
  };

  // Handle New Plan from Wizard
  const handleWizardSubmit = async (formData: OnboardingFormValues) => {
    setIsGenerating(true);
    try {
      const newPlan = await generateEventPlanWithAI(formData);
      if (currentUser) {
        newPlan.userId = currentUser.id;
      }
      const updatedList = [newPlan, ...plans];
      setPlans(updatedList);
      savePlans(updatedList, currentUser?.id);
      setActiveId(newPlan.id);
      setActivePlanId(newPlan.id);
      setIsWizardOpen(false);
      setCurrentView('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast(`Generated master plan for "${newPlan.basics.title}"!`);
    } catch (err) {
      console.error('Failed to generate plan:', err);
      showToast('Error generating plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Copilot Direct Patching
  const handleApplyCopilotPatch = (patchAction: any) => {
    if (!activePlan || !patchAction) return;

    if (patchAction.type === 'apply_budget') {
      const { guestCount, categoryToBoost, amountToAdd, totalBudget, cutAmount, reallocateFreeVenue, freedAmount } = patchAction.data;

      let newItems = [...activePlan.budget.items];
      let newTotal = activePlan.budget.totalBudget;
      let newGuests = activePlan.basics.guestCount;

      if (guestCount) newGuests = guestCount;
      if (totalBudget !== undefined) newTotal = totalBudget;

      if (amountToAdd && categoryToBoost) {
        newItems = newItems.map((item) => {
          if (item.category.toLowerCase().includes(categoryToBoost.toLowerCase())) {
            return { ...item, allocatedAmount: item.allocatedAmount + amountToAdd };
          }
          return item;
        });
      }

      if (reallocateFreeVenue && freedAmount) {
        newItems = newItems.map((item) => {
          const lower = item.category.toLowerCase();
          if (lower.includes('venue')) {
            return { ...item, allocatedAmount: Math.max(0, item.allocatedAmount - freedAmount) };
          }
          if (lower.includes('catering') || lower.includes('food')) {
            return { ...item, allocatedAmount: item.allocatedAmount + Math.round(freedAmount * 0.5) };
          }
          if (lower.includes('music') || lower.includes('entertainment')) {
            return { ...item, allocatedAmount: item.allocatedAmount + Math.round(freedAmount * 0.3) };
          }
          if (item.isContingency) {
            return { ...item, allocatedAmount: item.allocatedAmount + Math.round(freedAmount * 0.2) };
          }
          return item;
        });
      }

      if (cutAmount) {
        newItems = newItems.map((item) => {
          const lower = item.category.toLowerCase();
          if (lower.includes('decor') || lower.includes('stationery')) {
            return { ...item, allocatedAmount: Math.max(0, Math.round(item.allocatedAmount * 0.7)) };
          }
          return item;
        });
      }

      updateActivePlan({
        basics: {
          ...activePlan.basics,
          guestCount: newGuests,
          totalBudget: newTotal,
        },
        budget: {
          ...activePlan.budget,
          totalBudget: newTotal,
          items: newItems,
        },
      });

      showToast('Applied AI Copilot recommendation to your budget!');
    } else if (patchAction.type === 'update_theme') {
      const { dietaryShift } = patchAction.data;
      updateActivePlan({
        basics: {
          ...activePlan.basics,
          preferences: {
            ...activePlan.basics.preferences,
            dietaryNotes: `${activePlan.basics.preferences.dietaryNotes}; ${dietaryShift}`,
          },
        },
      });
      showToast('Updated dietary preferences and creative notes!');
    }
  };

  // Handle What-If Simulator Scenario Application (Phase 5)
  const handleApplyScenario = (newBudget: number, newGuestCount: number, updatedItems?: BudgetItem[]) => {
    if (!activePlan) return;
    const items = updatedItems || activePlan.budget.items;
    const updatedPlan: EventPlan = {
      ...activePlan,
      basics: {
        ...activePlan.basics,
        totalBudget: newBudget,
        guestCount: newGuestCount,
      },
      budget: {
        ...activePlan.budget,
        totalBudget: newBudget,
        items: items,
      },
      updatedAt: new Date().toISOString(),
    };
    const updatedList = plans.map((p) => (p.id === activePlan.id ? updatedPlan : p));
    setPlans(updatedList);
    savePlans(updatedList);
    showToast(`Applied What-If scenario (${newGuestCount} guests, $${newBudget.toLocaleString()} budget)!`);
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  // iCal Export
  const handleExportICS = () => {
    if (!activePlan) return;
    downloadCalendarICS(activePlan);
    showToast('Downloaded .ics calendar file with all milestones!');
  };

  // Open Indian Event Intelligence or launch Indian Wedding Wizard
  const handleOpenIndianIntelligenceOrWizard = () => {
    if (activePlan && currentView === 'dashboard') {
      setIsIndianIntelligenceOpen(true);
    } else {
      setWizardInitialValues({
        eventType: 'wedding',
        currency: 'INR',
        isIndianWeddingPlan: true,
        guestCount: 250,
        totalBudget: 2500000,
        title: 'Grand Indian Wedding Celebration (शुभ विवाह)',
      });
      setIsWizardOpen(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100vw', overflowX: 'clip' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(28, 18, 12, 0.95)',
            border: '1px solid rgba(251, 146, 60, 0.4)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(234, 88, 12, 0.35)',
            color: '#fff',
            padding: '0.65rem 1.4rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <Sparkles size={16} color="var(--color-amber-400)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        plans={plans}
        activePlan={activePlan}
        onSelectPlan={handleSelectPlan}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyOpen(true)}
        onOpenPlanManager={() => setIsPlanManagerOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        onPrint={handlePrint}
        onExportICS={handleExportICS}
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateDashboard={() => {
          setCurrentView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateUserDashboard={() => {
          setCurrentView('user-hub');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAiTransparency={() => setIsAiTransparencyOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenIndianIntelligence={handleOpenIndianIntelligenceOrWizard}
        onToggleLanguage={() => {
          if (activePlan) {
            const nextLang = activePlan.language === 'hi' ? 'en' : 'hi';
            updateActivePlan({ language: nextLang });
            showToast(nextLang === 'hi' ? 'योजना हिंदी में सेट की गई' : 'Plan switched to English');
          }
        }}
        language={activePlan?.language || 'en'}
      />

      {/* Main Container */}
      <main className="app-container" style={{ flex: '1 0 auto', width: '100%', maxWidth: '100%', minWidth: 0 }}>
        {/* VIEW 1: DEDICATED FULL-FEATURED HOMEPAGE */}
        {currentView === 'home' && (
          <HomePage
            plans={plans}
            onOpenWizard={(initialValues) => {
              setWizardInitialValues(initialValues || null);
              setIsWizardOpen(true);
            }}
            onSelectPlanAndOpenDashboard={handleSelectPlan}
            onOpenPlanManager={() => setIsPlanManagerOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateUserDashboard={() => {
              setCurrentView('user-hub');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
          />
        )}

        {/* VIEW 2: DEDICATED PERSONAL USER DASHBOARD */}
        {currentView === 'user-hub' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            plans={plans}
            activePlanId={activePlanId}
            onSelectPlan={handleSelectPlan}
            onOpenWizard={() => setIsWizardOpen(true)}
            onOpenExpenseLedger={() => setIsExpenseLedgerOpen(true)}
            onOpenAiDocumentStudio={() => setIsAiDocsOpen(true)}
            onOpenWhatIfSimulator={() => setIsWhatIfModalOpen(true)}
            onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
            onPrintPlan={(plan) => {
              setActiveId(plan.id);
              setTimeout(() => window.print(), 200);
            }}
            onSharePlan={(plan) => {
              setActiveId(plan.id);
              setIsShareModalOpen(true);
            }}
            onRenamePlan={handleRenamePlan}
            onDuplicatePlan={handleDuplicatePlan}
            onDeletePlan={handleDeletePlan}
            onSignOut={() => {
              logoutUser();
              setCurrentUser(null);
              const guestPlans = loadSavedPlans();
              setPlans(guestPlans);
              setActiveId(getActivePlanId(guestPlans));
              setCurrentView('home');
              showToast('Signed out (switched to Guest Mode)');
            }}
            onNavigateHome={() => {
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToEventWorkspace={(planId) => {
              if (planId) {
                setActiveId(planId);
                setActivePlanId(planId);
              }
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: MASTER EVENT WORKSPACE DASHBOARD */}
        {currentView === 'dashboard' && activePlan && (
          <div>
            {/* Top Workspace Navigation Bar */}
            <div
              className="no-print"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                onClick={() => {
                  if (currentUser) {
                    setCurrentView('user-hub');
                  } else {
                    setCurrentView('home');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} />
                <span>{currentUser ? '← Back to My Dashboard' : '← Back to Homepage'}</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.85rem',
                  color: '#4A2B1A',
                  fontWeight: 600,
                  background: 'rgba(234, 88, 12, 0.08)',
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(234, 88, 12, 0.2)',
                }}
              >
                <span>Active Master Plan:</span>
                <strong style={{ color: '#140A05' }}>{activePlan.basics.title}</strong>
              </div>
            </div>

            {/* Master Event Header */}
            <EventHeader
              plan={activePlan}
              onOpenAiTransparency={() => setIsAiTransparencyOpen(true)}
              onOpenShareModal={() => setIsShareModalOpen(true)}
              onOpenAiDocs={() => setIsAiDocsOpen(true)}
              onOpenChangeImpact={() => setIsChangeImpactOpen(true)}
              onOpenConflictChecker={() => setIsConflictCheckerOpen(true)}
              onOpenIndianIntelligence={() => setIsIndianIntelligenceOpen(true)}
              onToggleLanguage={() => {
                const nextLang = activePlan.language === 'hi' ? 'en' : 'hi';
                updateActivePlan({ language: nextLang });
                showToast(nextLang === 'hi' ? 'योजना हिंदी में सेट की गई' : 'Plan switched to English');
              }}
              onPrint={handlePrint}
              onExportICS={handleExportICS}
              currentUser={currentUser}
            />

            {/* Priority 3.1: Next Best Step Card */}
            <NextBestStepCard
              plan={activePlan}
              onCompleteTask={handleCompleteTaskFromNextStep}
              onNavigateToTimeline={() => setActiveTab('timeline')}
            />

            {/* 5 Synchronized Modules Navigation Tabs */}
            <div className="no-print" style={{ marginBottom: '2rem' }}>
              <div
                className="tab-bar glass-panel-subtle"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  padding: '0.4rem',
                  gap: '0.5rem',
                }}
              >
                {/* Tab 1: Budget Hub */}
                <button
                  id="tab-btn-budget"
                  onClick={() => setActiveTab('budget')}
                  className="btn-ghost"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background:
                      activeTab === 'budget'
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : '#FFFFFF',
                    border:
                      activeTab === 'budget'
                        ? '1.5px solid rgba(251, 146, 60, 0.4)'
                        : '1.5px solid rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'budget' ? '#FFFFFF' : '#140A05',
                    fontWeight: 700,
                    boxShadow: activeTab === 'budget' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(45, 24, 15, 0.04)',
                  }}
                >
                  <DollarSign size={18} color={activeTab === 'budget' ? '#FFFFFF' : '#C2410C'} />
                  <span>1. Smart Budget Hub</span>
                </button>

                {/* Tab 2: Timeline & Roadmap */}
                <button
                  id="tab-btn-timeline"
                  onClick={() => setActiveTab('timeline')}
                  className="btn-ghost"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background:
                      activeTab === 'timeline'
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : '#FFFFFF',
                    border:
                      activeTab === 'timeline'
                        ? '1.5px solid rgba(251, 146, 60, 0.4)'
                        : '1.5px solid rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'timeline' ? '#FFFFFF' : '#140A05',
                    fontWeight: 700,
                    boxShadow: activeTab === 'timeline' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(45, 24, 15, 0.04)',
                  }}
                >
                  <Calendar size={18} color={activeTab === 'timeline' ? '#FFFFFF' : '#C2410C'} />
                  <span>2. Timeline & Run of Show</span>
                </button>

                {/* Tab 3: Vendor Checklist */}
                <button
                  id="tab-btn-vendors"
                  onClick={() => setActiveTab('vendors')}
                  className="btn-ghost"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background:
                      activeTab === 'vendors'
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : '#FFFFFF',
                    border:
                      activeTab === 'vendors'
                        ? '1.5px solid rgba(251, 146, 60, 0.4)'
                        : '1.5px solid rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'vendors' ? '#FFFFFF' : '#140A05',
                    fontWeight: 700,
                    boxShadow: activeTab === 'vendors' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(45, 24, 15, 0.04)',
                  }}
                >
                  <Users size={18} color={activeTab === 'vendors' ? '#FFFFFF' : '#C2410C'} />
                  <span>3. Vendor Pipeline</span>
                </button>

                {/* Tab 4: Ideas & Moodboard */}
                <button
                  id="tab-btn-ideas"
                  onClick={() => setActiveTab('ideas')}
                  className="btn-ghost"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background:
                      activeTab === 'ideas'
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : '#FFFFFF',
                    border:
                      activeTab === 'ideas'
                        ? '1.5px solid rgba(251, 146, 60, 0.4)'
                        : '1.5px solid rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'ideas' ? '#FFFFFF' : '#140A05',
                    fontWeight: 700,
                    boxShadow: activeTab === 'ideas' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(45, 24, 15, 0.04)',
                  }}
                >
                  <Sparkles size={18} color={activeTab === 'ideas' ? '#FFFFFF' : '#C2410C'} />
                  <span>4. Moodboard & DIY</span>
                </button>

                {/* Tab 5: Guests & Seating Studio */}
                <button
                  id="tab-btn-guests"
                  onClick={() => setActiveTab('guests')}
                  className="btn-ghost"
                  style={{
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background:
                      activeTab === 'guests'
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : '#FFFFFF',
                    border:
                      activeTab === 'guests'
                        ? '1.5px solid rgba(251, 146, 60, 0.4)'
                        : '1.5px solid rgba(234, 88, 12, 0.2)',
                    color: activeTab === 'guests' ? '#FFFFFF' : '#140A05',
                    fontWeight: 700,
                    boxShadow: activeTab === 'guests' ? '0 4px 15px rgba(234, 88, 12, 0.3)' : '0 2px 6px rgba(45, 24, 15, 0.04)',
                  }}
                >
                  <UserCheck size={18} color={activeTab === 'guests' ? '#FFFFFF' : '#C2410C'} />
                  <span>5. Guests & Seating</span>
                </button>

                {/* Tab 6: Community Ops (For Community Events) */}
                {activePlan.basics.eventType === 'community' && (
                  <button
                    id="tab-btn-community"
                    onClick={() => setActiveTab('community')}
                    className="btn-ghost"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      background:
                        activeTab === 'community'
                          ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                          : '#FFFFFF',
                      border:
                        activeTab === 'community'
                          ? '1.5px solid rgba(251, 146, 60, 0.4)'
                          : '1.5px solid rgba(234, 88, 12, 0.2)',
                      color: activeTab === 'community' ? '#FFFFFF' : '#140A05',
                      fontWeight: 700,
                      boxShadow:
                        activeTab === 'community'
                          ? '0 4px 15px rgba(234, 88, 12, 0.3)'
                          : '0 2px 6px rgba(45, 24, 15, 0.04)',
                    }}
                  >
                    <Megaphone size={18} color={activeTab === 'community' ? '#FFFFFF' : '#C2410C'} />
                    <span>6. Community Ops & Permits</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Module Views */}
            <div className="no-print">
              {activeTab === 'budget' && (
                <BudgetHub
                  plan={activePlan}
                  onUpdateBudget={handleUpdateBudget}
                  onOpenWhatIfSimulator={() => setIsWhatIfModalOpen(true)}
                  onOpenExpenseLedger={() => setIsExpenseLedgerOpen(true)}
                />
              )}

              {activeTab === 'timeline' && (
                <TimelineRoadmap
                  plan={activePlan}
                  onUpdateTimeline={handleUpdateTimeline}
                  onOpenWeatherContingency={() => setIsWeatherModalOpen(true)}
                  onOpenLiveDirector={() => setIsLiveDirectorOpen(true)}
                />
              )}

              {activeTab === 'vendors' && (
                <VendorChecklist plan={activePlan} onUpdateVendors={handleUpdateVendors} />
              )}

              {activeTab === 'ideas' && (
                <CreativeIdeas plan={activePlan} onUpdateIdeas={handleUpdateIdeas} />
              )}

              {activeTab === 'guests' && (
                <GuestSeatingHub
                  plan={activePlan}
                  onUpdateGuests={handleUpdateGuests}
                  onUpdateTables={handleUpdateTables}
                />
              )}

              {activeTab === 'community' && (
                <CommunityChecklistHub
                  plan={activePlan}
                  onUpdateChecklist={(items) => updateActivePlan({ communityChecklist: items })}
                />
              )}
            </div>
          </div>
        )}

        {/* Print-Only Layout Component */}
        {activePlan && <PrintView plan={activePlan} />}
      </main>

      {/* Dark Footer Treatment */}
      <Footer onOpenAiTransparency={() => setIsAiTransparencyOpen(true)} />

      {/* AI Copilot Drawer */}
      {activePlan && (
        <AICopilotDrawer
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          plan={activePlan}
          onApplyPatch={handleApplyCopilotPatch}
        />
      )}

      {/* 5-Step Setup Wizard Modal */}
      <SetupWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setWizardInitialValues(null);
        }}
        onSubmit={handleWizardSubmit}
        isGenerating={isGenerating}
        initialFormValues={wizardInitialValues}
      />

      {/* Plan Manager Modal */}
      <PlanManagerModal
        isOpen={isPlanManagerOpen}
        onClose={() => setIsPlanManagerOpen(false)}
        plans={plans}
        activePlanId={activePlanId}
        onSelectPlan={handleSelectPlan}
        onRenamePlan={handleRenamePlan}
        onDuplicatePlan={handleDuplicatePlan}
        onDeletePlan={handleDeletePlan}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setIsPlanManagerOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Option C: Hybrid Auth & Database Sync Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(user) => {
          setCurrentUser(user);
          if (user) {
            const userPlans = loadSavedPlans(user.id);
            setPlans(userPlans);
            setActiveId(getActivePlanId(userPlans));
            setCurrentView('user-hub');
            showToast(`Welcome to your dashboard, ${user.fullName}`);
          } else {
            const guestPlans = loadSavedPlans();
            setPlans(guestPlans);
            setActiveId(getActivePlanId(guestPlans));
            setCurrentView('home');
            showToast('Signed out (switched to Guest Mode)');
          }
        }}
        onSyncTriggered={() => showToast('Plans synced to cloud!')}
      />

      {/* AI Transparency & Limitations Policy Modal (Challenge 5) */}
      <AiTransparencyModal
        isOpen={isAiTransparencyOpen}
        onClose={() => setIsAiTransparencyOpen(false)}
      />

      {/* Share & Collaboration Modal */}
      {activePlan && (
        <ShareCollaborateModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          plan={activePlan}
        />
      )}

      {/* AI Celebration Document & Speech Studio */}
      {activePlan && (
        <AiDocumentModal
          isOpen={isAiDocsOpen}
          onClose={() => setIsAiDocsOpen(false)}
          plan={activePlan}
        />
      )}

      {/* Interactive What-If Sensitivity Simulator */}
      {activePlan && (
        <WhatIfSimulator
          isOpen={isWhatIfModalOpen}
          onClose={() => setIsWhatIfModalOpen(false)}
          plan={activePlan}
          onApplyScenario={handleApplyScenario}
        />
      )}

      {/* Real-Time Expense Ledger Modal */}
      {activePlan && (
        <ExpenseLedgerModal
          isOpen={isExpenseLedgerOpen}
          onClose={() => setIsExpenseLedgerOpen(false)}
          plan={activePlan}
          onUpdateExpenses={handleUpdateExpenses}
        />
      )}

      {/* Weather Plan B Contingency Modal */}
      {activePlan && (
        <WeatherContingencyModal
          isOpen={isWeatherModalOpen}
          onClose={() => setIsWeatherModalOpen(false)}
          plan={activePlan}
          onUpdateBudget={handleUpdateBudget}
          onUpdateRunOfShow={(updatedRunOfShow) => {
            updateActivePlan({ runOfShow: updatedRunOfShow });
            showToast('Weather Plan B: Schedule shifted to covered indoor venue!');
          }}
        />
      )}

      {/* Day-Of Live Event Director Modal */}
      {activePlan && (
        <LiveEventDirectorModal
          isOpen={isLiveDirectorOpen}
          onClose={() => setIsLiveDirectorOpen(false)}
          plan={activePlan}
          onUpdateRunOfShow={(updatedRunOfShow) => {
            updateActivePlan({ runOfShow: updatedRunOfShow });
          }}
        />
      )}

      {/* Feature 1: Change Impact Assistant Modal */}
      {activePlan && (
        <ChangeImpactModal
          isOpen={isChangeImpactOpen}
          onClose={() => setIsChangeImpactOpen(false)}
          plan={activePlan}
          onApplyChanges={handleApplyChangeImpactPlan}
        />
      )}

      {/* Feature 2: Plan Inconsistency & Conflict Checker Modal */}
      {activePlan && (
        <PlanConflictModal
          isOpen={isConflictCheckerOpen}
          onClose={() => setIsConflictCheckerOpen(false)}
          plan={activePlan}
          onUpdatePlan={(updatedFields) => {
            updateActivePlan(updatedFields);
          }}
        />
      )}

      {/* Indian Event Intelligence Modal (भारतीय इवेंट इंटेलिजेंस) */}
      {activePlan && (
        <IndianEventIntelligenceModal
          isOpen={isIndianIntelligenceOpen}
          onClose={() => setIsIndianIntelligenceOpen(false)}
          plan={activePlan}
          onUpdatePlan={(updatedFields) => {
            updateActivePlan(updatedFields);
            showToast('Updated Indian Event Intelligence configuration');
          }}
        />
      )}

      {/* Gemini API Key Modal */}
      <ApiKeyModal isOpen={isApiKeyOpen} onClose={() => setIsApiKeyOpen(false)} />
    </div>
  );
}

export default App;
