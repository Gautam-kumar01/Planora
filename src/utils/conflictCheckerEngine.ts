import { EventPlan, PlanConflictFinding } from '../types';
import { formatCurrency } from './deterministicMath';

/**
 * Feature 2: Plan Conflict Checker Engine
 * Evaluates event plan data for inconsistencies, capacity deficits, budget mismatches,
 * timeline anomalies, vendor lead time bottlenecks, and dietary/allergy risks.
 *
 * Rules:
 * - Clear severity: 'needs_attention' (High) or 'worth_checking' (Medium).
 * - Uncertain/missing info labeled 'Unable to verify' or asks the user.
 * - Disclaimers: Reminds users to confirm with relevant professionals (no legal/medical guarantees).
 */
export function runPlanConflictAudit(plan: EventPlan): PlanConflictFinding[] {
  const findings: PlanConflictFinding[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDateObj = plan.basics.eventDate ? new Date(plan.basics.eventDate) : null;
  if (eventDateObj) eventDateObj.setHours(0, 0, 0, 0);

  const daysUntilEvent = eventDateObj
    ? Math.round((eventDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // -------------------------------------------------------------
  // 1. Guest Count vs. Known Venue or Seating Capacity
  // -------------------------------------------------------------
  const tables = plan.tables || [];
  if (tables.length > 0) {
    const totalTableSeats = tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
    const guestCount = plan.basics.guestCount || 0;

    if (guestCount > totalTableSeats) {
      const deficit = guestCount - totalTableSeats;
      findings.push({
        id: 'conflict-capacity-table-deficit',
        category: 'capacity',
        severity: 'needs_attention',
        title: 'Guest Count Exceeds Configured Seating Capacity',
        explanation: `Your plan tracks ${guestCount} attendees, but configured tables provide only ${totalTableSeats} seats (${deficit} unseated guests).`,
        affectedDetails: `Guest count: ${guestCount} attendees | Seating capacity: ${totalTableSeats} seats across ${tables.length} tables.`,
        suggestedNextStep: `Add ${Math.ceil(deficit / 8)} additional tables in Guests & Seating or adjust capacity in your layout plan.`,
        disclaimer: 'Seating calculations reflect configured tables only. Verify venue fire marshal maximum occupancy with venue management.',
      });
    }
  } else {
    // No tables configured yet
    findings.push({
      id: 'conflict-capacity-unverified',
      category: 'capacity',
      severity: 'worth_checking',
      title: 'Floor Plan Capacity: Unable to Verify',
      explanation: `No table seating layout is currently recorded for ${plan.basics.guestCount} attendees.`,
      affectedDetails: `Venue: ${plan.basics.location || 'Pending'} | Attendees: ${plan.basics.guestCount}`,
      suggestedNextStep: 'Open the Guests & Seating Studio to configure tables or confirm maximum venue capacity with your facility host.',
      disclaimer: 'Always request certified venue floor plans and standing/seated limits directly from your venue coordinator.',
    });
  }

  // -------------------------------------------------------------
  // 2. Budget Allocations vs. Total Budget
  // -------------------------------------------------------------
  const totalBudget = plan.budget.totalBudget || 0;
  const totalAllocated = plan.budget.items.reduce((sum, i) => sum + i.allocatedAmount, 0);

  if (totalAllocated > totalBudget) {
    const overage = totalAllocated - totalBudget;
    findings.push({
      id: 'conflict-budget-overage',
      category: 'budget',
      severity: 'needs_attention',
      title: 'Category Allocations Exceed Total Budget',
      explanation: `Your itemized category allocations sum to ${formatCurrency(
        totalAllocated,
        plan.budget.currency
      )}, which exceeds your total target budget of ${formatCurrency(
        totalBudget,
        plan.budget.currency
      )} by ${formatCurrency(overage, plan.budget.currency)}.`,
      affectedDetails: `Total Budget: ${formatCurrency(totalBudget, plan.budget.currency)} | Allocations: ${formatCurrency(totalAllocated, plan.budget.currency)} (Deficit: -${formatCurrency(overage, plan.budget.currency)})`,
      suggestedNextStep: 'Open the Smart Budget Hub and adjust category amounts or increase your total event budget to balance allocations.',
    });
  } else if (totalAllocated < totalBudget && totalBudget > 0) {
    const unallocated = totalBudget - totalAllocated;
    findings.push({
      id: 'conflict-budget-underallocated',
      category: 'budget',
      severity: 'worth_checking',
      title: 'Unallocated Budget Surplus',
      explanation: `There is an unallocated amount of ${formatCurrency(
        unallocated,
        plan.budget.currency
      )} floating without assigned categories.`,
      affectedDetails: `Target: ${formatCurrency(totalBudget, plan.budget.currency)} | Allocated: ${formatCurrency(totalAllocated, plan.budget.currency)} | Unassigned: ${formatCurrency(unallocated, plan.budget.currency)}`,
      suggestedNextStep: 'Allocate remaining funds into your Contingency Reserve or specialty entertainment line items.',
    });
  }

  // -------------------------------------------------------------
  // 3. Timeline Tasks: Overdue or Scheduled After Event Date
  // -------------------------------------------------------------
  plan.timeline.forEach((section) => {
    section.tasks.forEach((task) => {
      if (!task.completed && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);

        // Check 3A: Task scheduled after event date
        if (eventDateObj && taskDate.getTime() > eventDateObj.getTime()) {
          findings.push({
            id: `conflict-task-after-event-${task.id}`,
            category: 'timeline',
            severity: 'needs_attention',
            title: `Task Scheduled After Event Date: "${task.title}"`,
            explanation: `The due date (${taskDate.toLocaleDateString()}) is set after the event date (${eventDateObj.toLocaleDateString()}). Preparation tasks must be completed prior to event day.`,
            affectedDetails: `Milestone: ${task.title} | Due: ${task.dueDate} | Event Date: ${plan.basics.eventDate}`,
            suggestedNextStep: `Reschedule "${task.title}" to an earlier preparation date in the Timeline & Roadmap.`,
          });
        }
        // Check 3B: Task overdue
        else if (taskDate.getTime() < today.getTime()) {
          const daysOverdue = Math.round((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
          findings.push({
            id: `conflict-task-overdue-${task.id}`,
            category: 'timeline',
            severity: 'needs_attention',
            title: `Overdue Milestone: "${task.title}"`,
            explanation: `This incomplete task was due ${daysOverdue} day(s) ago (${taskDate.toLocaleDateString()}).`,
            affectedDetails: `Task: ${task.title} (${task.priority} Priority) | Section: ${section.period} | Due Date: ${task.dueDate}`,
            suggestedNextStep: 'Mark as completed if finished, or update the target date to reflect your current schedule.',
          });
        }
      }
    });
  });

  // -------------------------------------------------------------
  // 4. Vendor Lead Times vs. Event Date
  // -------------------------------------------------------------
  if (daysUntilEvent !== null && daysUntilEvent > 0) {
    plan.vendors.forEach((vendor) => {
      // Check if unbooked vendor has a lead time requirement that exceeds remaining days
      if (vendor.status === 'to_research' || vendor.status === 'contacted') {
        const leadTimeLower = (vendor.targetLeadTime || '').toLowerCase();
        let minDaysRequired = 0;

        if (leadTimeLower.includes('9-12 month') || leadTimeLower.includes('12 month')) {
          minDaysRequired = 270;
        } else if (leadTimeLower.includes('6-9 month') || leadTimeLower.includes('8 month')) {
          minDaysRequired = 180;
        } else if (leadTimeLower.includes('3-4 month') || leadTimeLower.includes('4 month')) {
          minDaysRequired = 90;
        } else if (leadTimeLower.includes('6-8 week') || leadTimeLower.includes('2 month')) {
          minDaysRequired = 45;
        } else if (leadTimeLower.includes('3-4 week')) {
          minDaysRequired = 21;
        }

        if (minDaysRequired > 0 && daysUntilEvent < minDaysRequired) {
          findings.push({
            id: `conflict-vendor-lead-time-${vendor.id}`,
            category: 'vendors',
            severity: 'needs_attention',
            title: `Compressed Lead Time: ${vendor.service}`,
            explanation: `Standard lead time is "${vendor.targetLeadTime}", but your event is in ${daysUntilEvent} days. This vendor service is still marked as "${vendor.status}".`,
            affectedDetails: `Service: ${vendor.service} | Status: ${vendor.status} | Standard Lead Time: ${vendor.targetLeadTime} | Days until event: ${daysUntilEvent}`,
            suggestedNextStep: `Request quotes immediately or contact backup providers to secure prime date availability.`,
            disclaimer: 'Vendor availability varies by region and season. Confirm dates directly with individual vendor teams.',
          });
        }
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Guest Dietary & Allergy Requirements vs. Caterer Confirmation
  // -------------------------------------------------------------
  const guests = plan.guests || [];
  const severeAllergies = guests.filter(
    (g) =>
      g.dietary &&
      g.dietary !== 'None' &&
      (g.dietary.toLowerCase().includes('nut') ||
        g.dietary.toLowerCase().includes('allergy') ||
        g.dietary.toLowerCase().includes('gluten') ||
        g.dietary.toLowerCase().includes('dairy'))
  );

  if (severeAllergies.length > 0) {
    const cateringVendor = plan.vendors.find(
      (v) =>
        v.service.toLowerCase().includes('cater') ||
        v.service.toLowerCase().includes('food') ||
        v.service.toLowerCase().includes('baker')
    );

    const isCateringConfirmed = cateringVendor && cateringVendor.status === 'booked';

    if (!isCateringConfirmed) {
      findings.push({
        id: 'conflict-dietary-allergens-unconfirmed',
        category: 'dietary',
        severity: 'worth_checking',
        title: `Allergen Notice: ${severeAllergies.length} Guest Dietary Flag(s)`,
        explanation: `${severeAllergies.length} attendee(s) have recorded allergy or dietary requirements (${severeAllergies
          .map((g) => `${g.name}: ${g.dietary}`)
          .slice(0, 3)
          .join(', ')}), but catering has not been marked as booked.`,
        affectedDetails: `Flagged guests: ${severeAllergies.length} | Catering Status: ${cateringVendor?.status || 'Not listed'}`,
        suggestedNextStep: 'Provide specific dietary lists to caterers during quote requests and ask for designated allergen preparation prep areas.',
        disclaimer: 'Medical & Allergen Notice: Planora is an organizational planning tool. Never assume caterer accommodation without direct written confirmation from certified kitchen staff.',
      });
    }
  }

  // -------------------------------------------------------------
  // 6. Community Event Permitting vs. Approaching Date
  // -------------------------------------------------------------
  if (plan.basics.eventType === 'community' && daysUntilEvent !== null && daysUntilEvent < 60) {
    const checklist = plan.communityChecklist || [];
    const permitItem = checklist.find((c) => c.category === 'Permits' && c.status === 'needed');

    if (permitItem) {
      findings.push({
        id: 'conflict-community-permits-urgent',
        category: 'dates',
        severity: 'needs_attention',
        title: `City / Park Permit Application Pending (${permitItem.title})`,
        explanation: `Municipal park, sound, or street closure permits often require 30 to 60 days processing time. Your event is in ${daysUntilEvent} days.`,
        affectedDetails: `Requirement: ${permitItem.title} | Status: Needed | Days Remaining: ${daysUntilEvent}`,
        suggestedNextStep: 'Submit municipal special event permit paperwork to city department immediately.',
        disclaimer: 'Legal & Permitting Notice: Check your specific city or municipal requirements directly with local civil authorities.',
      });
    }
  }

  // Filter out any findings already marked as resolved or dismissed
  const resolvedIds = new Set(plan.resolvedConflictIds || []);
  const dismissedIds = new Set(plan.dismissedConflictIds || []);

  return findings.map((f) => ({
    ...f,
    isResolved: resolvedIds.has(f.id),
    isDismissed: dismissedIds.has(f.id),
  }));
}
