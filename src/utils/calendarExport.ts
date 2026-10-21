// Calendar .ics iCalendar Exporter
// Generates standard RFC 5545 iCalendar files for event milestones and tasks

import { EventPlan } from '../types';

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function escapeICS(str: string): string {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function generateICSContent(plan: EventPlan): string {
  const now = new Date();
  const dtStamp = formatDateToICS(now);
  const eventBaseDate = plan.basics.eventDate ? new Date(plan.basics.eventDate) : new Date(now.getTime() + 90 * 86400000);

  let icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Planora//Event Copilot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(plan.basics.title)} Milestones`,
  ];

  // 1. Main Event Day Entry
  const eventStart = new Date(eventBaseDate);
  eventStart.setHours(9, 0, 0, 0);
  const eventEnd = new Date(eventBaseDate);
  eventEnd.setHours(23, 0, 0, 0);

  icsLines.push('BEGIN:VEVENT');
  icsLines.push(`UID:planora-event-${plan.id}@planora.app`);
  icsLines.push(`DTSTAMP:${dtStamp}`);
  icsLines.push(`DTSTART:${formatDateToICS(eventStart)}`);
  icsLines.push(`DTEND:${formatDateToICS(eventEnd)}`);
  icsLines.push(`SUMMARY:🎉 ${escapeICS(plan.basics.title)} (Event Day!)`);
  icsLines.push(`DESCRIPTION:${escapeICS(plan.summary + '\\n\\nVibe: ' + plan.basics.preferences.vibe)}`);
  if (plan.basics.location) {
    icsLines.push(`LOCATION:${escapeICS(plan.basics.location)}`);
  }
  icsLines.push('STATUS:CONFIRMED');
  icsLines.push('BEGIN:VALARM');
  icsLines.push('TRIGGER:-P1D');
  icsLines.push('ACTION:DISPLAY');
  icsLines.push(`DESCRIPTION:Reminder: Tomorrow is ${escapeICS(plan.basics.title)}!`);
  icsLines.push('END:VALARM');
  icsLines.push('END:VEVENT');

  // 2. Timeline Tasks as Calendar Milestones
  let taskCounter = 0;
  plan.timeline.forEach((section) => {
    section.tasks.forEach((task) => {
      taskCounter++;
      let taskDate = task.dueDate ? new Date(task.dueDate) : new Date(eventBaseDate.getTime() - (taskCounter * 7 * 86400000));
      if (isNaN(taskDate.getTime())) {
        taskDate = new Date(eventBaseDate.getTime() - 14 * 86400000);
      }
      taskDate.setHours(10, 0, 0, 0);
      const taskEndDate = new Date(taskDate.getTime() + 3600000);

      icsLines.push('BEGIN:VEVENT');
      icsLines.push(`UID:task-${task.id || taskCounter}-${plan.id}@planora.app`);
      icsLines.push(`DTSTAMP:${dtStamp}`);
      icsLines.push(`DTSTART:${formatDateToICS(taskDate)}`);
      icsLines.push(`DTEND:${formatDateToICS(taskEndDate)}`);
      icsLines.push(`SUMMARY:[Planora ${task.priority}] ${escapeICS(task.title)}`);
      icsLines.push(`DESCRIPTION:Phase: ${escapeICS(section.period)}\\nCategory: ${task.category}\\nPriority: ${task.priority}`);
      icsLines.push('STATUS:CONFIRMED');
      if (task.priority === 'High') {
        icsLines.push('BEGIN:VALARM');
        icsLines.push('TRIGGER:-P2D');
        icsLines.push('ACTION:DISPLAY');
        icsLines.push(`DESCRIPTION:Reminder: High priority milestone due in 2 days: ${escapeICS(task.title)}`);
        icsLines.push('END:VALARM');
      }
      icsLines.push('END:VEVENT');
    });
  });

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n');
}

export function downloadCalendarICS(plan: EventPlan) {
  const icsData = generateICSContent(plan);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = plan.basics.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `${sanitizedTitle || 'planora_event'}_timeline.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
