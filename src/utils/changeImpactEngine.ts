import { EventPlan, PlanImpactSuggestion, ChangeImpactAnalysis } from '../types';
import { formatCurrency } from './deterministicMath';

/**
 * Feature 1: Change Impact Assistant Engine
 * Evaluates the impact of changing critical event details (guest count, budget, date, venue, vibe).
 * Generates plain-language explanations and separate suggested updates.
 * Calculations are strictly deterministic; suggestions are labeled as estimates.
 */
export function analyzePlanChangeImpact(
  currentPlan: EventPlan,
  proposedChanges: {
    guestCount?: number;
    totalBudget?: number;
    eventDate?: string;
    location?: string;
    vibe?: string;
  }
): ChangeImpactAnalysis {
  const currentBasics = currentPlan.basics;
  const changedFields: ChangeImpactAnalysis['changedFields'] = [];
  const explanations: string[] = [];
  const suggestions: PlanImpactSuggestion[] = [];

  // 1. Guest Count Change
  if (
    proposedChanges.guestCount !== undefined &&
    proposedChanges.guestCount !== currentBasics.guestCount
  ) {
    const oldGuests = currentBasics.guestCount || 1;
    const newGuests = proposedChanges.guestCount;
    const ratio = newGuests / oldGuests;
    const diff = newGuests - oldGuests;

    changedFields.push({
      field: 'guestCount',
      label: 'Guest Count',
      oldValue: `${oldGuests} attendees`,
      newValue: `${newGuests} attendees`,
    });

    if (diff > 0) {
      explanations.push(
        `Increasing guest count from ${oldGuests} to ${newGuests} (+${diff}) increases catering, drink quantities, and may exceed your current seated capacity.`
      );
    } else {
      explanations.push(
        `Decreasing guest count from ${oldGuests} to ${newGuests} (${diff}) reduces per-head food & beverage requirements, freeing up budget for premium upgrades.`
      );
    }

    // Impact on Catering / Food Budget Item
    const cateringItem = currentPlan.budget.items.find(
      (i) =>
        i.category.toLowerCase().includes('catering') ||
        i.category.toLowerCase().includes('food') ||
        i.category.toLowerCase().includes('refreshment')
    );

    if (cateringItem) {
      const estimatedNewAmount = Math.round(cateringItem.allocatedAmount * ratio);
      suggestions.push({
        id: `impact-budget-catering-${Date.now()}`,
        section: 'budget',
        targetItemTitle: cateringItem.category,
        fieldAffected: 'allocatedAmount',
        currentValue: formatCurrency(cateringItem.allocatedAmount, currentPlan.budget.currency),
        suggestedValue: formatCurrency(estimatedNewAmount, currentPlan.budget.currency),
        rationale: `Proportional catering adjustment for ${newGuests} attendees (calculated at approx ${formatCurrency(
          Math.round(cateringItem.allocatedAmount / oldGuests),
          currentPlan.budget.currency
        )} per guest).`,
        isEstimate: true,
      });
    }

    // Impact on Seating Capacity
    if (currentPlan.tables && currentPlan.tables.length > 0) {
      const totalCapacity = currentPlan.tables.reduce((sum, t) => sum + (t.capacity || 0), 0);
      if (newGuests > totalCapacity) {
        const extraSeatsNeeded = newGuests - totalCapacity;
        const tablesNeeded = Math.ceil(extraSeatsNeeded / 8);
        suggestions.push({
          id: `impact-capacity-tables-${Date.now()}`,
          section: 'capacity',
          targetItemTitle: 'Table Seating Capacity',
          fieldAffected: 'tableCount',
          currentValue: `${totalCapacity} seats (${currentPlan.tables.length} tables)`,
          suggestedValue: `${newGuests} seats (+${tablesNeeded} new 8-top tables needed)`,
          rationale: `Your current floor plan seats ${totalCapacity} guests. ${extraSeatsNeeded} guests currently have no assigned table space.`,
          isEstimate: false,
        });
      }
    }

    // Impact on Favors & Place Cards Task
    const favorsTask = currentPlan.timeline
      .flatMap((s) => s.tasks)
      .find((t) => t.title.toLowerCase().includes('favor') || t.title.toLowerCase().includes('place card'));
    if (favorsTask) {
      suggestions.push({
        id: `impact-task-favors-${Date.now()}`,
        section: 'timeline',
        targetItemTitle: favorsTask.title,
        fieldAffected: 'title',
        currentValue: favorsTask.title,
        suggestedValue: `Order & personalize ${newGuests} guest favors and seating place cards`,
        rationale: `Recalibrated quantity to match updated attendee headcount of ${newGuests}.`,
        isEstimate: false,
      });
    }
  }

  // 2. Total Budget Change
  if (
    proposedChanges.totalBudget !== undefined &&
    proposedChanges.totalBudget !== currentPlan.budget.totalBudget
  ) {
    const oldBudget = currentPlan.budget.totalBudget;
    const newBudget = proposedChanges.totalBudget;
    const diff = newBudget - oldBudget;

    changedFields.push({
      field: 'totalBudget',
      label: 'Total Budget',
      oldValue: formatCurrency(oldBudget, currentPlan.budget.currency),
      newValue: formatCurrency(newBudget, currentPlan.budget.currency),
    });

    if (diff > 0) {
      explanations.push(
        `Increasing budget by ${formatCurrency(diff, currentPlan.budget.currency)} creates room to strengthen contingency buffers or expand entertainment & decor.`
      );
    } else {
      explanations.push(
        `Reducing budget by ${formatCurrency(Math.abs(diff), currentPlan.budget.currency)} requires tightening category allocations to prevent over-budget deficits.`
      );
    }

    // Suggest contingency reserve update
    const contingencyItem = currentPlan.budget.items.find((i) => i.isContingency);
    if (contingencyItem) {
      const suggestedContingency = Math.round(newBudget * 0.08); // 8% buffer
      suggestions.push({
        id: `impact-budget-contingency-${Date.now()}`,
        section: 'budget',
        targetItemTitle: contingencyItem.category,
        fieldAffected: 'allocatedAmount',
        currentValue: formatCurrency(contingencyItem.allocatedAmount, currentPlan.budget.currency),
        suggestedValue: formatCurrency(suggestedContingency, currentPlan.budget.currency),
        rationale: `Re-anchors emergency reserve to 8% of new total budget for peace of mind.`,
        isEstimate: true,
      });
    }
  }

  // 3. Event Date Change
  if (
    proposedChanges.eventDate !== undefined &&
    proposedChanges.eventDate !== currentBasics.eventDate
  ) {
    const oldDateStr = currentBasics.eventDate || 'Undecided';
    const newDateStr = proposedChanges.eventDate;

    changedFields.push({
      field: 'eventDate',
      label: 'Target Event Date',
      oldValue: oldDateStr ? new Date(oldDateStr).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Undecided',
      newValue: newDateStr ? new Date(newDateStr).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'Undecided',
    });

    if (oldDateStr && newDateStr) {
      const oldTime = new Date(oldDateStr).getTime();
      const newTime = new Date(newDateStr).getTime();
      const daysDiff = Math.round((newTime - oldTime) / (1000 * 60 * 60 * 24));

      if (daysDiff < 0) {
        explanations.push(
          `Moving event date earlier by ${Math.abs(daysDiff)} days compresses planning timelines and accelerates vendor booking deadlines.`
        );
      } else {
        explanations.push(
          `Postponing event by ${daysDiff} days provides additional runway for bookings and guest RSVPs.`
        );
      }

      // Check vendor booking lead times
      const daysUntilNewDate = Math.round((newTime - Date.now()) / (1000 * 60 * 60 * 24));
      const criticalVendors = currentPlan.vendors.filter(
        (v) => v.status === 'to_research' || v.status === 'contacted'
      );

      criticalVendors.slice(0, 2).forEach((vendor) => {
        suggestions.push({
          id: `impact-vendor-urgency-${vendor.id}-${Date.now()}`,
          section: 'vendors',
          targetItemTitle: vendor.service,
          fieldAffected: 'urgency',
          currentValue: vendor.urgency,
          suggestedValue: daysUntilNewDate < 90 ? 'Immediate' : 'Standard',
          rationale: `Event is in ${daysUntilNewDate} days. Elevating booking priority keeps availability open.`,
          isEstimate: true,
        });
      });
    }
  }

  // 4. Venue / Location Change
  if (
    proposedChanges.location !== undefined &&
    proposedChanges.location !== currentBasics.location
  ) {
    changedFields.push({
      field: 'location',
      label: 'Venue / Location',
      oldValue: currentBasics.location || 'Pending',
      newValue: proposedChanges.location || 'Pending',
    });

    explanations.push(
      `Changing location to "${proposedChanges.location}" may require reviewing venue access hours, noise ordinances, and travel coordination for out-of-town guests.`
    );

    // If venue looks outdoor or public park
    const locLower = (proposedChanges.location || '').toLowerCase();
    const isOutdoor = locLower.includes('park') || locLower.includes('beach') || locLower.includes('garden') || locLower.includes('outdoor');

    if (isOutdoor) {
      suggestions.push({
        id: `impact-contingency-weather-${Date.now()}`,
        section: 'timeline',
        targetItemTitle: 'Weather & Rain Canopy Contingency',
        fieldAffected: 'taskRequired',
        currentValue: 'Standard Indoor Setup',
        suggestedValue: 'Secure 48-Hour Rain Canopy Backup & Wind Tie-downs',
        rationale: 'Outdoor venues require tenting backup, generator access, and weather monitoring.',
        isEstimate: true,
      });
    }
  }

  // 5. Vibe / Atmosphere Change
  if (
    proposedChanges.vibe !== undefined &&
    proposedChanges.vibe !== currentBasics.preferences.vibe
  ) {
    changedFields.push({
      field: 'vibe',
      label: 'Styling Vibe',
      oldValue: currentBasics.preferences.vibe,
      newValue: proposedChanges.vibe,
    });

    explanations.push(
      `Switching vibe to "${proposedChanges.vibe}" suggests reviewing decorative lighting, floral color tones, and musical entertainment to match.`
    );

    suggestions.push({
      id: `impact-idea-vibe-${Date.now()}`,
      section: 'ideas',
      targetItemTitle: 'Visual Palette & Decor Concepts',
      fieldAffected: 'themeConcept',
      currentValue: currentPlan.themeConcept.title,
      suggestedValue: `Refresh theme concept & swatches aligned with "${proposedChanges.vibe}"`,
      rationale: 'Updates ambient lighting and creative recommendations without touching your budget allocations.',
      isEstimate: true,
    });
  }

  return {
    changedFields,
    plainLanguageExplanation: explanations,
    suggestions,
  };
}

/**
 * Applies only user-confirmed change impact suggestions.
 * Strictly preserves all other plan sections and unaccepted items.
 */
export function applyAcceptedImpactSuggestions(
  currentPlan: EventPlan,
  acceptedSuggestions: PlanImpactSuggestion[],
  updatedBasics: Partial<EventPlan['basics']>
): EventPlan {
  let updatedPlan: EventPlan = {
    ...currentPlan,
    basics: {
      ...currentPlan.basics,
      ...updatedBasics,
      preferences: {
        ...currentPlan.basics.preferences,
        ...(updatedBasics.preferences || {}),
        vibe: updatedBasics.preferences?.vibe || currentPlan.basics.preferences.vibe,
      },
    },
    updatedAt: new Date().toISOString(),
  };

  // If total budget changed in basics, update plan.budget.totalBudget
  if (updatedBasics.totalBudget !== undefined) {
    updatedPlan.budget = {
      ...updatedPlan.budget,
      totalBudget: updatedBasics.totalBudget,
    };
  }

  // Apply accepted suggestions individually
  acceptedSuggestions.forEach((sugg) => {
    if (sugg.section === 'budget' && sugg.fieldAffected === 'allocatedAmount') {
      // Parse numeric amount from string or number
      const numVal =
        typeof sugg.suggestedValue === 'number'
          ? sugg.suggestedValue
          : parseInt(String(sugg.suggestedValue).replace(/[^0-9]/g, ''), 10);

      if (!isNaN(numVal)) {
        updatedPlan.budget = {
          ...updatedPlan.budget,
          items: updatedPlan.budget.items.map((item) =>
            item.category === sugg.targetItemTitle
              ? { ...item, allocatedAmount: numVal }
              : item
          ),
        };
      }
    } else if (sugg.section === 'vendors' && sugg.fieldAffected === 'urgency') {
      updatedPlan.vendors = updatedPlan.vendors.map((vendor) =>
        vendor.service === sugg.targetItemTitle
          ? { ...vendor, urgency: sugg.suggestedValue as any }
          : vendor
      );
    } else if (sugg.section === 'timeline' && sugg.fieldAffected === 'title') {
      updatedPlan.timeline = updatedPlan.timeline.map((sec) => ({
        ...sec,
        tasks: sec.tasks.map((task) =>
          task.title === sugg.currentValue
            ? { ...task, title: String(sugg.suggestedValue) }
            : task
        ),
      }));
    }
  });

  return updatedPlan;
}
