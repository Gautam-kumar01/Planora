import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Tag,
  Download,
  Sparkles,
  MapPin,
  User,
  Filter,
  CloudRain,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, TaskItem, TimelineSection, HourlyRunOfShowItem } from '../types';
import { downloadCalendarICS } from '../utils/calendarExport';
import { calculateTaskDateStatus } from '../utils/deterministicMath';

interface TimelineRoadmapProps {
  plan: EventPlan;
  onUpdateTimeline: (updatedTimeline: TimelineSection[], updatedRunOfShow?: HourlyRunOfShowItem[]) => void;
  onOpenWeatherContingency?: () => void;
  onOpenLiveDirector?: () => void;
}

export const TimelineRoadmap: React.FC<TimelineRoadmapProps> = ({
  plan,
  onUpdateTimeline,
  onOpenWeatherContingency,
  onOpenLiveDirector,
}) => {
  const { timeline, runOfShow } = plan;
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'runOfShow'>('roadmap');

  // New task modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState(timeline[0]?.id || '');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Logistics' | 'Creative' | 'Payment' | 'Guest Coordination'>('Logistics');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Toggle task completion
  const handleToggleTask = (sectionId: string, taskId: string) => {
    let nowCompleted = false;

    const updated = timeline.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          tasks: section.tasks.map((task) => {
            if (task.id === taskId) {
              nowCompleted = !task.completed;
              return { ...task, completed: !task.completed };
            }
            return task;
          }),
        };
      }
      return section;
    });

    onUpdateTimeline(updated);

    if (nowCompleted) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f97316', '#f59e0b', '#fbbf24', '#c2410c'],
        });
      } catch {}
    }
  };

  // Add new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      dueDate: newTaskDueDate || undefined,
      completed: false,
      category: newTaskCategory,
      priority: newTaskPriority,
    };

    const updated = timeline.map((section) => {
      if (section.id === targetSectionId) {
        return {
          ...section,
          tasks: [...section.tasks, newTask],
        };
      }
      return section;
    });

    onUpdateTimeline(updated);
    setNewTaskTitle('');
    setShowTaskModal(false);
  };

  // Calculate task counts
  const totalTasks = timeline.reduce((acc, sec) => acc + sec.tasks.length, 0);
  const completedTasks = timeline.reduce(
    (acc, sec) => acc + sec.tasks.filter((t) => t.completed).length,
    0
  );
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter tasks (Priority 2.2: Task Date Awareness)
  const filterTask = (task: TaskItem) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pending') return !task.completed;
    if (selectedFilter === 'Completed') return task.completed;
    const dateStatus = calculateTaskDateStatus(task.dueDate, plan.basics.eventDate, task.completed);
    if (selectedFilter === 'Overdue') return dateStatus.status === 'overdue';
    if (selectedFilter === 'Due Soon') return dateStatus.status === 'due_soon';
    return task.category === selectedFilter;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Controls Header */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Sub-Tabs: Roadmap vs Day-of Run of Show */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(234, 88, 12, 0.08)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid rgba(234, 88, 12, 0.25)',
            }}
          >
            <button
              onClick={() => setActiveTab('roadmap')}
              className="btn-ghost"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 1.15rem',
                fontSize: '0.85rem',
                background: activeTab === 'roadmap' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                color: activeTab === 'roadmap' ? '#FFFFFF' : '#140A05',
                fontWeight: 700,
                boxShadow: activeTab === 'roadmap' ? '0 2px 10px rgba(234, 88, 12, 0.3)' : 'none',
              }}
            >
              Milestone Roadmap ({completedTasks}/{totalTasks})
            </button>
            <button
              onClick={() => setActiveTab('runOfShow')}
              className="btn-ghost"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 1.15rem',
                fontSize: '0.85rem',
                background: activeTab === 'runOfShow' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                color: activeTab === 'runOfShow' ? '#FFFFFF' : '#140A05',
                fontWeight: 700,
                boxShadow: activeTab === 'runOfShow' ? '0 2px 10px rgba(234, 88, 12, 0.3)' : 'none',
              }}
            >
              Day-of Run of Show ({runOfShow?.length || 0} slots)
            </button>
          </div>

          {/* Progress pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#4A2B1A', fontWeight: 600 }}>Progress:</span>
            <div
              style={{
                width: '120px',
                height: '8px',
                background: 'rgba(234, 88, 12, 0.15)',
                borderRadius: '99px',
                overflow: 'hidden',
                border: '1px solid rgba(234, 88, 12, 0.2)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${completionRate}%`,
                  background: 'linear-gradient(90deg, #F59E0B, #16A34A)',
                }}
              />
            </div>
            <span style={{ fontSize: '0.875rem', color: '#15803D', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
              {completionRate}%
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          {onOpenWeatherContingency && (
            <button
              id="btn-weather-contingency"
              type="button"
              onClick={onOpenWeatherContingency}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', color: '#0369A1', borderColor: 'rgba(2, 132, 199, 0.35)' }}
              title="Simulate weather disruption, activate rain plan B & marquee draw"
            >
              <CloudRain size={14} color="#0284C7" />
              <span>Weather Plan B</span>
            </button>
          )}

          {onOpenLiveDirector && (
            <button
              id="btn-live-director-toolbar"
              type="button"
              onClick={onOpenLiveDirector}
              className="btn-secondary"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', color: '#C2410C', borderColor: 'rgba(234, 88, 12, 0.35)' }}
              title="Launch full-screen live event director mode"
            >
              <Zap size={14} color="#EA580C" />
              <span>Live Director</span>
            </button>
          )}

          <button
            onClick={() => downloadCalendarICS(plan)}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
          >
            <Download size={14} />
            <span>Export .ics</span>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="btn-primary"
            style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MILESTONE ROADMAP */}
      {activeTab === 'roadmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* FR-17 & FR-19 Milestone Context Banner */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1px solid rgba(234, 88, 12, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.825rem',
              color: '#372013',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#C2410C" />
              <span>
                <strong>{plan.basics.dateType === 'undecided' ? 'Relative Milestones Mode (FR-17):' : 'Chronological Timeline:'}</strong>{' '}
                {plan.basics.dateType === 'undecided'
                  ? 'Tasks are sequenced by relative milestone offsets (e.g., T-minus weeks/months) so you can plan before fixing a date.'
                  : 'Tasks are ordered chronologically toward your event day.'}{' '}
                Tasks marked <strong style={{ color: '#B91C1C' }}>Critical</strong> highlight key decision bottlenecks (FR-19).
              </span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#573523', fontWeight: 600, marginRight: '0.35rem' }}>
              <Filter size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
              Filter by:
            </span>
            {['All', 'Overdue', 'Due Soon', 'Pending', 'Completed', 'Logistics', 'Creative', 'Payment', 'Guest Coordination'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFilter(tag)}
                className="btn-secondary"
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.78rem',
                  background: selectedFilter === tag ? 'rgba(234, 88, 12, 0.3)' : undefined,
                  borderColor: selectedFilter === tag ? 'var(--color-orange-400)' : undefined,
                  color: selectedFilter === tag ? '#fff' : undefined,
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Timeline Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {timeline.map((section, sIdx) => {
              const visibleTasks = section.tasks.filter(filterTask);
              if (visibleTasks.length === 0 && selectedFilter !== 'All') return null;

              return (
                <div key={section.id} className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1.25rem',
                      borderBottom: '1px solid rgba(251, 146, 60, 0.15)',
                      paddingBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #ea580c, #9a3412)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {sIdx + 1}
                      </div>
                      <h3 style={{ fontSize: '1.25rem' }}>{section.period}</h3>
                    </div>

                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {visibleTasks.filter((t) => t.completed).length} of {visibleTasks.length} done
                    </span>
                  </div>

                  {/* Tasks in Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {visibleTasks.map((task) => {
                      const dateStatus = calculateTaskDateStatus(task.dueDate, plan.basics.eventDate, task.completed);
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(section.id, task.id)}
                          className="glass-card-interactive"
                          style={{
                            padding: '0.9rem 1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem',
                            background: task.completed ? 'rgba(234, 88, 12, 0.05)' : '#FFFFFF',
                            borderColor: task.completed
                              ? 'rgba(22, 163, 74, 0.35)'
                              : dateStatus.status === 'overdue'
                              ? '#FCA5A5'
                              : dateStatus.status === 'due_soon'
                              ? '#FCD34D'
                              : 'rgba(234, 88, 12, 0.18)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 auto' }}>
                            <button
                              type="button"
                              aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {task.completed ? (
                                <CheckCircle2 size={20} color="#15803D" />
                              ) : (
                                <Circle size={20} color="#EA580C" />
                              )}
                            </button>

                            <div>
                              <span
                                style={{
                                  fontSize: '0.95rem',
                                  color: task.completed ? '#78533E' : '#140A05',
                                  textDecoration: task.completed ? 'line-through' : 'none',
                                  fontWeight: task.completed ? 400 : 600,
                                }}
                              >
                                {task.title}
                              </span>
                              {task.dueDate && (
                                <div style={{ fontSize: '0.75rem', color: '#9A3412', marginTop: '0.2rem', fontWeight: 600 }}>
                                  Target Due: {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Priority 2.2: Task Date Status Badge */}
                            {task.completed ? (
                              <span
                                className="badge"
                                style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #86EFAC', fontSize: '0.65rem', fontWeight: 700 }}
                              >
                                ✓ Completed
                              </span>
                            ) : dateStatus.status === 'overdue' ? (
                              <span
                                className="badge"
                                style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', fontSize: '0.65rem', fontWeight: 700 }}
                              >
                                ⚠️ {dateStatus.label}
                              </span>
                            ) : dateStatus.status === 'due_soon' ? (
                              <span
                                className="badge"
                                style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: '0.65rem', fontWeight: 700 }}
                              >
                                ⏳ {dateStatus.label}
                              </span>
                            ) : dateStatus.status === 'upcoming' ? (
                              <span
                                className="badge"
                                style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', fontSize: '0.65rem' }}
                              >
                                📅 {dateStatus.label}
                              </span>
                            ) : null}

                            <span
                              className="badge"
                              style={{
                                background:
                                  task.priority === 'High'
                                    ? 'rgba(225, 29, 72, 0.12)'
                                    : task.priority === 'Medium'
                                    ? 'rgba(217, 119, 6, 0.14)'
                                    : 'rgba(100, 116, 139, 0.14)',
                                color:
                                  task.priority === 'High'
                                    ? '#B91C1C'
                                    : task.priority === 'Medium'
                                    ? '#92400E'
                                    : '#334155',
                                border:
                                  task.priority === 'High'
                                    ? '1px solid rgba(225, 29, 72, 0.3)'
                                    : task.priority === 'Medium'
                                    ? '1px solid rgba(217, 119, 6, 0.3)'
                                    : '1px solid rgba(100, 116, 139, 0.25)',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                              }}
                            >
                              {task.priority === 'High' ? '🔥 Critical' : `${task.priority} Priority`}
                            </span>

                            <span
                              className="badge badge-orange"
                              style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}
                            >
                              {task.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-OF RUN OF SHOW */}
      {activeTab === 'runOfShow' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.35rem', color: '#140A05', fontWeight: 800 }}>
                Day-of Event Hourly Run of Show
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
                Master chronological schedule for staff, vendors, and coordinators to ensure effortless execution.
              </p>
            </div>
            {onOpenLiveDirector && (
              <button
                id="btn-launch-live-director"
                type="button"
                onClick={onOpenLiveDirector}
                className="btn-primary pulse-glow"
                style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
              >
                <Zap size={16} />
                <span>Launch Live Event Director Mode ⚡</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {runOfShow?.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1.25rem',
                  background: '#FFFFFF',
                  border: '1px solid rgba(234, 88, 12, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem 1.4rem',
                  boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                }}
              >
                {/* Time Badge */}
                <div
                  style={{
                    flex: '0 0 110px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: '#C2410C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Clock size={16} color="#EA580C" />
                  <span>{item.time}</span>
                </div>

                {/* Activity Detail */}
                <div style={{ flex: '1 1 auto' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#140A05', marginBottom: '0.3rem' }}>
                    {item.activity}
                  </div>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {item.owner && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <User size={14} color="#D97706" />
                        <span>Lead: <strong style={{ color: '#9A3412', fontWeight: 700 }}>{item.owner}</strong></span>
                      </div>
                    )}
                    {item.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#C2410C" />
                        <span>Location: <strong style={{ color: '#9A3412', fontWeight: 700 }}>{item.location}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: '#140A05', fontWeight: 800 }}>
              Add New Milestone Task
            </h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Milestone Phase
                </label>
                <select
                  className="glass-input"
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                >
                  {timeline.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.period}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Task Title
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Schedule final dress fitting with tailor"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Category
                  </label>
                  <select
                    className="glass-input"
                    value={newTaskCategory}
                    onChange={(e: any) => setNewTaskCategory(e.target.value)}
                  >
                    <option value="Logistics">Logistics</option>
                    <option value="Creative">Creative</option>
                    <option value="Payment">Payment</option>
                    <option value="Guest Coordination">Guest Coordination</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Priority
                  </label>
                  <select
                    className="glass-input"
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  className="glass-input"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
