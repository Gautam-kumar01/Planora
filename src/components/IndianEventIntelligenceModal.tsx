import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Calendar,
  UtensilsCrossed,
  ShieldCheck,
  AlertTriangle,
  CloudRain,
  Zap,
  HeartHandshake,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  Info,
  Clock,
  MapPin,
  Users,
  Languages,
} from 'lucide-react';
import {
  EventPlan,
  IndianEventConfig,
  IndianFunctionItem,
  IndianPermitItem,
  IndianCateringConfig,
  IndianBackupConfig,
  IndianCateringDiet,
} from '../types';
import {
  formatIndianCurrency,
  calculateIndianCateringBreakdown,
  HINDI_TERMS,
  generateDefaultIndianFunctions,
  generateDefaultIndianPermits,
  generateDefaultIndianCatering,
  generateDefaultIndianBackups,
} from '../utils/indianEventEngine';

interface IndianEventIntelligenceModalProps {
  plan: EventPlan;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (updatedFields: Partial<EventPlan>) => void;
}

export const IndianEventIntelligenceModal: React.FC<IndianEventIntelligenceModalProps> = ({
  plan,
  isOpen,
  onClose,
  onUpdatePlan,
}) => {
  if (!isOpen) return null;

  // Initialize or load existing Indian Intelligence configuration
  const initialConfig: IndianEventConfig = plan.indianIntelligence || {
    isEnabled: true,
    region: 'North',
    language: plan.language || 'en',
    functions: generateDefaultIndianFunctions(plan.basics.eventType, plan.basics.guestCount, plan.basics.eventDate),
    catering: generateDefaultIndianCatering(plan.basics.eventType, plan.basics.guestCount),
    permits: generateDefaultIndianPermits(plan.basics.eventType),
    backups: generateDefaultIndianBackups(),
  };

  const [activeTab, setActiveTab] = useState<'functions' | 'catering' | 'permits' | 'backup' | 'language'>('functions');
  const [config, setConfig] = useState<IndianEventConfig>(initialConfig);
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(null);

  // Helper for catering calculation
  const cateringMath = calculateIndianCateringBreakdown(plan.basics.guestCount, config.catering);

  // Count unverified permits
  const unverifiedPermitsCount = config.permits.filter((p) => p.status === 'to_verify' && p.isMandatory).length;

  const handleSave = () => {
    onUpdatePlan({
      indianIntelligence: config,
      language: config.language,
      basics: {
        ...plan.basics,
        currency: 'INR', // Indian Intelligence sets standard INR currency
      },
    });
    onClose();
  };

  // Add a new ritual / function
  const handleAddFunction = () => {
    const newFn: IndianFunctionItem = {
      id: `fn-${Date.now()}`,
      type: 'sangeet',
      title: 'New Cultural Celebration',
      hindiTitle: 'नया सांस्कृतिक कार्यक्रम',
      date: plan.basics.eventDate || new Date().toISOString().split('T')[0],
      startTime: '06:00 PM',
      endTime: '10:00 PM',
      venueName: 'Main Banquet Hall',
      dressCode: 'Traditional Indian',
      expectedGuests: plan.basics.guestCount,
      ritualNotes: 'Sequence family performances and guest dining schedule.',
      isCompleted: false,
    };
    setConfig((prev) => ({
      ...prev,
      functions: [...prev.functions, newFn],
    }));
    setEditingFunctionId(newFn.id);
  };

  const handleDeleteFunction = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      functions: prev.functions.filter((f) => f.id !== id),
    }));
  };

  const handleUpdateFunction = (id: string, updates: Partial<IndianFunctionItem>) => {
    setConfig((prev) => ({
      ...prev,
      functions: prev.functions.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  // Update permit status
  const handleTogglePermitStatus = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      permits: prev.permits.map((p) => {
        if (p.id !== id) return p;
        const nextStatus = p.status === 'to_verify' ? 'verified' : p.status === 'verified' ? 'not_applicable' : 'to_verify';
        return {
          ...p,
          status: nextStatus,
          verifiedAt: nextStatus === 'verified' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  };

  const isHindi = config.language === 'hi';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1C130D 0%, #2D180F 100%)',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(251, 146, 60, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#1C130D',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} color="#FF9933" />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                  {isHindi ? 'भारतीय इवेंट इंटेलिजेंस' : 'Indian Event Intelligence'}
                </h2>
                <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                  🇮🇳 Bharat Mode
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#FED7AA' }}>
                {isHindi
                  ? 'बहु-दिवसीय समारोह, शुद्ध शाकाहारी/जैन कैटरिंग, कानूनी अनुमतियां व बैकअप व्यवस्था'
                  : 'Multi-day rituals, pure veg/Jain catering math, statutory permits & backup protocols'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Language Quick Toggle */}
            <button
              type="button"
              onClick={() => setConfig((prev) => ({ ...prev, language: prev.language === 'en' ? 'hi' : 'en' }))}
              className="btn-ghost"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                borderRadius: '99px',
                color: '#FED7AA',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Toggle English / हिंदी"
            >
              <Languages size={14} color="#FB923C" />
              <span>{isHindi ? 'English' : 'हिंदी'}</span>
            </button>

            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.4rem', color: '#FED7AA' }}
              aria-label="Close Indian Intelligence Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="tab-bar"
          style={{
            background: 'rgba(251, 247, 240, 0.8)',
            borderBottom: '1px solid rgba(234, 88, 12, 0.15)',
            padding: '0.5rem 1.5rem',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('functions')}
            className={`btn-ghost ${activeTab === 'functions' ? 'tab-active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'functions' ? '#EA580C' : 'transparent',
              color: activeTab === 'functions' ? '#FFFFFF' : '#6B4226',
            }}
          >
            <Calendar size={15} style={{ marginRight: '0.35rem' }} />
            <span>{isHindi ? 'समारोह व रस्में' : 'Multi-Day Functions'} ({config.functions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catering')}
            className={`btn-ghost ${activeTab === 'catering' ? 'tab-active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'catering' ? '#EA580C' : 'transparent',
              color: activeTab === 'catering' ? '#FFFFFF' : '#6B4226',
            }}
          >
            <UtensilsCrossed size={15} style={{ marginRight: '0.35rem' }} />
            <span>{isHindi ? 'खानपान व थाली गणना' : 'Catering & 10% Buffer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('permits')}
            className={`btn-ghost ${activeTab === 'permits' ? 'tab-active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'permits' ? '#EA580C' : 'transparent',
              color: activeTab === 'permits' ? '#FFFFFF' : '#6B4226',
            }}
          >
            <ShieldCheck size={15} style={{ marginRight: '0.35rem' }} />
            <span>{isHindi ? 'कानूनी परमिट व सत्यापन' : 'Permits & Truth Audit'}</span>
            {unverifiedPermitsCount > 0 && (
              <span
                style={{
                  marginLeft: '0.4rem',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '99px',
                }}
              >
                {unverifiedPermitsCount} {isHindi ? 'सत्याप्य' : 'to verify'}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`btn-ghost ${activeTab === 'backup' ? 'tab-active' : ''}`}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'backup' ? '#EA580C' : 'transparent',
              color: activeTab === 'backup' ? '#FFFFFF' : '#6B4226',
            }}
          >
            <Zap size={15} style={{ marginRight: '0.35rem' }} />
            <span>{isHindi ? 'जनरेटर व सुगमता' : 'DG Sets & Weather'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem', background: '#FFFFFF' }}>
          {/* TAB 1: MULTI-DAY FUNCTIONS */}
          {activeTab === 'functions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                    {isHindi ? 'भारतीय विवाह व सांस्कृतिक अनुक्रम' : 'Multi-Event Ceremony Sequencing'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: '0.2rem 0 0 0' }}>
                    {isHindi
                      ? 'मेहंदी, हल्दी, संगीत, बारात, फेरे और रिसेप्शन की अलग-अलग व्यवस्था और अतिथि संख्या।'
                      : 'Schedule Mehendi, Haldi, Sangeet, Baraat, Pheras & Reception with distinct headcounts and dress codes.'}
                  </p>
                </div>

                <button
                  onClick={handleAddFunction}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} />
                  <span>{isHindi ? 'नया समारोह जोड़ें' : 'Add Function'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {config.functions.map((fn, index) => {
                  const isEditing = editingFunctionId === fn.id;

                  return (
                    <div
                      key={fn.id}
                      style={{
                        border: '1.5px solid rgba(234, 88, 12, 0.22)',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(251, 247, 240, 0.4)',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#EA580C',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                            }}
                          >
                            {index + 1}
                          </span>
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#140A05' }}>
                              {isHindi ? fn.hindiTitle || fn.title : fn.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 600 }}>
                              {HINDI_TERMS[fn.type] || fn.type}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setEditingFunctionId(isEditing ? null : fn.id)}
                            className="btn-ghost"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
                          >
                            {isEditing ? (isHindi ? 'पूर्ण' : 'Done') : isHindi ? 'संपादित करें' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFunction(fn.id)}
                            className="btn-ghost"
                            style={{ padding: '0.3rem', color: '#DC2626' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Summary Row */}
                      {!isEditing && (
                        <div
                          style={{
                            marginTop: '0.85rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(234, 88, 12, 0.12)',
                            display: 'flex',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                            fontSize: '0.825rem',
                            color: '#4A2B1A',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={14} color="#EA580C" />
                            <span>{fn.date || 'Date TBD'} ({fn.startTime} - {fn.endTime})</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MapPin size={14} color="#EA580C" />
                            <span>{fn.venueName || 'Venue TBD'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Users size={14} color="#EA580C" />
                            <span>{fn.expectedGuests} Guests</span>
                          </div>
                          {fn.dressCode && (
                            <div style={{ fontSize: '0.8rem', color: '#6B4226', fontWeight: 500 }}>
                              <strong>Dress Code:</strong> {fn.dressCode}
                            </div>
                          )}
                        </div>
                      )}

                      {/* In-Place Editing Form */}
                      {isEditing && (
                        <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Title (English)
                            </label>
                            <input
                              type="text"
                              value={fn.title}
                              onChange={(e) => handleUpdateFunction(fn.id, { title: e.target.value })}
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Hindi Title (हिंदी शीर्षक)
                            </label>
                            <input
                              type="text"
                              value={fn.hindiTitle || ''}
                              onChange={(e) => handleUpdateFunction(fn.id, { hindiTitle: e.target.value })}
                              placeholder="जैसे: हल्दी समारोह"
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Date
                            </label>
                            <input
                              type="date"
                              value={fn.date || ''}
                              onChange={(e) => handleUpdateFunction(fn.id, { date: e.target.value })}
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Venue / Hall
                            </label>
                            <input
                              type="text"
                              value={fn.venueName || ''}
                              onChange={(e) => handleUpdateFunction(fn.id, { venueName: e.target.value })}
                              placeholder="e.g. Poolside Lawn"
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Expected Guests
                            </label>
                            <input
                              type="number"
                              value={fn.expectedGuests}
                              onChange={(e) => handleUpdateFunction(fn.id, { expectedGuests: parseInt(e.target.value) || 0 })}
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                              Dress Code Theme
                            </label>
                            <input
                              type="text"
                              value={fn.dressCode || ''}
                              onChange={(e) => handleUpdateFunction(fn.id, { dressCode: e.target.value })}
                              placeholder="e.g. Pastels & Ochre"
                              style={{ width: '100%', padding: '0.45rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CATERING & PLATE CALCULATOR */}
          {activeTab === 'catering' && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                  {isHindi ? 'भारतीय खानपान, थाली दर व 10% बफर गणना' : 'Indian Catering & Per-Plate Intelligence'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: '0.2rem 0 0 0' }}>
                  {isHindi
                    ? 'शुद्ध शाकाहारी, जैन और मांसाहारी खानपान का सटीक अनुमान तथा 10% अप्रत्याशित अतिथियों का आरक्षित कोटा।'
                    : 'Model Pure Vegetarian, Jain, and Non-Veg dietary splits with an automatic 10% buffer for unannounced guest arrivals.'}
                </p>
              </div>

              {/* Top Highlights Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
                    {isHindi ? 'तैयार की जाने वाली कुल थालियां' : 'Total Plates to Prepare'}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#140A05', fontFamily: 'var(--font-mono)' }}>
                    {cateringMath.totalPreparedPlates}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6B4226', marginTop: '0.2rem' }}>
                    {cateringMath.guaranteedPlates} {isHindi ? 'निश्चित' : 'Guaranteed'} + {cateringMath.bufferPlates} {isHindi ? '(10% बफर)' : '(10% Buffer)'}
                  </div>
                </div>

                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    {isHindi ? 'शुद्ध शाकाहारी व जैन थालियां' : 'Veg & Jain Plates'}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', fontFamily: 'var(--font-mono)' }}>
                    {cateringMath.vegPlates + cateringMath.jainPlates}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '0.2rem' }}>
                    {cateringMath.jainPlates} {isHindi ? 'जैन (बिना कंदमूल)' : 'Jain (Strict No Root Veg)'}
                  </div>
                </div>

                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                    {isHindi ? 'अनुमानित कुल खानपान बजट' : 'Total Catering Allocation'}
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309', fontFamily: 'var(--font-mono)' }}>
                    {formatIndianCurrency(cateringMath.totalCateringEstimate, true)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#92400E', marginTop: '0.2rem' }}>
                    {formatIndianCurrency(cateringMath.totalCateringEstimate)}
                  </div>
                </div>
              </div>

              {/* Configuration Sliders & Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(251, 247, 240, 0.5)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                {/* Diet Mode Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.5rem' }}>
                    {isHindi ? 'खानपान शैली (Dietary Philosophy)' : 'Primary Catering Philosophy'}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {[
                      { id: 'pure_veg', label: isHindi ? 'शुद्ध शाकाहारी (Pure Veg)' : 'Pure Vegetarian (No Egg/Meat)' },
                      { id: 'jain_veg', label: isHindi ? '100% जैन आहार' : 'Strict Jain (No Root Veg)' },
                      { id: 'mixed_veg_nonveg', label: isHindi ? 'शाकाहारी व मांसाहारी' : 'Veg + Non-Veg (Separate Counters)' },
                      { id: 'halal_certified', label: isHindi ? 'हलाल प्रमाणित' : 'Halal Certified Counters' },
                    ].map((diet) => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, dietType: diet.id as IndianCateringDiet } }))}
                        className="btn-ghost"
                        style={{
                          padding: '0.5rem 0.85rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: config.catering.dietType === diet.id ? '#EA580C' : 'rgba(234, 88, 12, 0.25)',
                          background: config.catering.dietType === diet.id ? '#EA580C' : '#FFFFFF',
                          color: config.catering.dietType === diet.id ? '#FFFFFF' : '#6B4226',
                        }}
                      >
                        {diet.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per-Plate Rate Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>
                      {isHindi ? 'प्रति थाली अनुमानित दर (₹ प्रति थाली)' : 'Estimated Per-Plate Rate (₹ INR / Plate)'}
                    </label>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#9A3412', fontSize: '1.05rem' }}>
                      ₹{config.catering.platePriceEstimate} / plate
                    </span>
                  </div>
                  <input
                    type="range"
                    min={400}
                    max={3500}
                    step={50}
                    value={config.catering.platePriceEstimate}
                    onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, platePriceEstimate: parseInt(e.target.value) || 1000 } }))}
                    style={{ width: '100%', accentColor: '#EA580C' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#78533E', marginTop: '0.2rem' }}>
                    <span>₹400 (Modest Community)</span>
                    <span>₹1,200 (Standard City Banquet)</span>
                    <span>₹3,500+ (5-Star Luxury Resort)</span>
                  </div>
                </div>

                {/* Jain Guests Dedicated Vessel Allocation */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#140A05', marginBottom: '0.35rem' }}>
                      {isHindi ? 'जैन अतिथियों की संख्या (अलग बर्तन व रसोई)' : 'Jain Guest Count (Isolated Preparation)'}
                    </label>
                    <input
                      type="number"
                      value={config.catering.jainGuestCount}
                      onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, jainGuestCount: parseInt(e.target.value) || 0 } }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#6B4226' }}>
                      {isHindi ? 'बिना प्याज, लहसुन व आलू के अलग तैयार किया जाएगा।' : 'Prepared without onion, garlic, or root vegetables in dedicated vessels.'}
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#140A05', marginBottom: '0.35rem' }}>
                      {isHindi ? 'अप्रत्याशित अतिथियों हेतु बफर प्रतिशत' : 'Unannounced Guest Buffer Margin (%)'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={config.catering.unannouncedBufferPercent}
                      onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, unannouncedBufferPercent: parseInt(e.target.value) || 10 } }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#6B4226' }}>
                      {isHindi ? 'भारतीय शादियों में 10% अतिरिक्त बफर अनिवार्य माना जाता है।' : 'Standard 10% buffer prevents sudden food shortage during peak arrival.'}
                    </span>
                  </div>
                </div>

                {/* Live Specialty Stations Checkboxes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#140A05', marginBottom: '0.5rem' }}>
                    {isHindi ? 'लाइव फूड काउंटर्स (Live Specialty Stations)' : 'Specialty Live Counters & Beverage Stations'}
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={config.catering.liveChaatCounters}
                        onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, liveChaatCounters: e.target.checked } }))}
                      />
                      <span>{isHindi ? 'लाइव चाट बाजार (पानी पूरी, टिक्की)' : 'Live Chaat Bazaar (+₹85/plate)'}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={config.catering.mithaiLiveCounters}
                        onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, mithaiLiveCounters: e.target.checked } }))}
                      />
                      <span>{isHindi ? 'गरमागरम जलेबी, रबड़ी व कुल्फी' : 'Live Jalebi-Rabdi & Kulfi (+₹95/plate)'}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={config.catering.beveragePaanCounter}
                        onChange={(e) => setConfig((prev) => ({ ...prev, catering: { ...prev.catering, beveragePaanCounter: e.target.checked } }))}
                      />
                      <span>{isHindi ? 'मसाला चाय, ठंडाई व शाही पान' : 'Thandai, Chai & Shahi Paan (+₹45/plate)'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL PERMITS & TRUTH VERIFICATION AUDIT */}
          {activeTab === 'permits' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '99px', color: '#991B1B', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  <AlertTriangle size={14} color="#DC2626" />
                  <span>Important Truth & Transparency Protocol</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                  {isHindi ? 'सरकारी अनुमतियां व वेंडर सत्यापन ऑडिट' : 'Statutory Permits & Verification Audit'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: '0.2rem 0 0 0' }}>
                  {isHindi
                    ? 'पुलिस साउंड एनओसी, कॉपीराइट संगीत लाइसेंस (PPL) तथा वेन्यू पेनल्टी को वर्तमान विश्वसनीय स्रोत से सत्यापित करें।'
                    : 'Show permits, venue availability, and vendor claims as items to verify unless backed by current reliable documentation.'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {config.permits.map((permit) => {
                  const isToVerify = permit.status === 'to_verify';
                  const isVerified = permit.status === 'verified';

                  return (
                    <div
                      key={permit.id}
                      style={{
                        border: `1.5px solid ${isToVerify ? '#F59E0B' : isVerified ? '#16A34A' : '#CBD5E1'}`,
                        borderRadius: 'var(--radius-md)',
                        background: isToVerify ? 'rgba(254, 243, 199, 0.25)' : isVerified ? 'rgba(240, 253, 244, 0.4)' : '#F8FAFC',
                        padding: '1.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#140A05' }}>
                              {isHindi ? permit.hindiTitle || permit.title : permit.title}
                            </span>
                            {permit.isMandatory && (
                              <span style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                                {isHindi ? 'अनिवार्य' : 'MANDATORY'}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6B4226', fontWeight: 600, marginTop: '0.15rem' }}>
                            {isHindi ? 'संबद्ध विभाग:' : 'Authority:'} {permit.authority}
                          </div>
                        </div>

                        {/* Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePermitStatus(permit.id)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: '99px',
                            border: '1.5px solid',
                            borderColor: isToVerify ? '#D97706' : isVerified ? '#16A34A' : '#94A3B8',
                            background: isToVerify ? '#FEF3C7' : isVerified ? '#DCFCE7' : '#F1F5F9',
                            color: isToVerify ? '#92400E' : isVerified ? '#166534' : '#475569',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            cursor: 'pointer',
                          }}
                        >
                          {isToVerify ? (
                            <>
                              <AlertTriangle size={13} color="#D97706" />
                              <span>⚠️ {isHindi ? 'सत्यापित करना बाकी' : 'TO VERIFY'}</span>
                            </>
                          ) : isVerified ? (
                            <>
                              <CheckCircle2 size={13} color="#16A34A" />
                              <span>✅ {isHindi ? 'सत्यापित' : 'VERIFIED'}</span>
                            </>
                          ) : (
                            <span>✖️ {isHindi ? 'लागू नहीं' : 'N/A'}</span>
                          )}
                        </button>
                      </div>

                      <p style={{ fontSize: '0.825rem', color: '#4A2B1A', lineHeight: 1.5, margin: '0.65rem 0 0 0', fontWeight: 500 }}>
                        {permit.guidance}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '0.78rem' }}>
                        <span style={{ color: '#78533E' }}>
                          <strong>{isHindi ? 'अनुमानित शुल्क:' : 'Statutory Fee:'}</strong> ₹{permit.estimatedFeeInr ? permit.estimatedFeeInr.toLocaleString('en-IN') : 'TBD'}
                        </span>
                        <span style={{ color: isToVerify ? '#D97706' : '#166534', fontWeight: 600 }}>
                          {isToVerify
                            ? (isHindi ? 'वर्तमान में असत्यापित • रसीद या एनओसी मांगें' : 'Unverified • Request official NOC receipt from vendor')
                            : (isHindi ? 'सत्यापित व सुरक्षित' : 'Document verified on file')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DG SETS & WEATHER BACKUPS */}
          {activeTab === 'backup' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                  {isHindi ? 'मौसम, जनरेटर बैकअप व वरिष्ठ नागरिक सुगमता' : 'Weather, DG Sets & Elder Accessibility'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: '0.2rem 0 0 0' }}>
                  {isHindi
                    ? 'अचानक बारिश, बिजली कटौती और बुजुर्ग रिश्तेदारों के लिए व्हीलचेयर रैंप की पूर्व तैयारी।'
                    : 'Prevent sudden power cuts, monsoon downpours, and ensure safe wheelchair movement for elders.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                <div style={{ border: '1.5px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Zap size={18} color="#EA580C" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#140A05' }}>
                      {isHindi ? 'साइलेंट डीजी सेट (जनरेटर बैकअप)' : 'Dual DG Set Generator Power'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6B4226', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                    {isHindi
                      ? 'डीजे, एसी और स्टेज लाइटिंग के लिए कम से कम 125 kVA का ड्यूल साइलेंट जनरेटर बैकअप।'
                      : 'Dual 125+ kVA silent diesel generators to prevent stage sound and AC blackouts during peak grid load.'}
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.backups.hasDualDGSet}
                      onChange={(e) => setConfig((prev) => ({ ...prev, backups: { ...prev.backups, hasDualDGSet: e.target.checked } }))}
                    />
                    <span>{isHindi ? 'जनरेटर बैकअप लॉक किया गया' : 'DG Set Power Backup Active'}</span>
                  </label>
                </div>

                <div style={{ border: '1.5px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CloudRain size={18} color="#0284C7" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#140A05' }}>
                      {isHindi ? 'वाटरप्रूफ जर्मन हैंगर पंडाल' : 'Waterproof German Hangar'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6B4226', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                    {isHindi
                      ? 'मानसून या अचानक आंधी-बारिश से बचाव हेतु वाटरप्रूफ टेंट व 6 इंच की ऊंची लकड़ी की फर्श।'
                      : 'Waterproof German hangar frame with raised wooden floor to safeguard buffet and mandap against rain.'}
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.backups.pandalWaterproofing}
                      onChange={(e) => setConfig((prev) => ({ ...prev, backups: { ...prev.backups, pandalWaterproofing: e.target.checked } }))}
                    />
                    <span>{isHindi ? 'वाटरप्रूफिंग शेल्टर आरक्षित' : 'Waterproof Canopy Guaranteed'}</span>
                  </label>
                </div>

                <div style={{ border: '1.5px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.25rem', background: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <HeartHandshake size={18} color="#16A34A" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#140A05' }}>
                      {isHindi ? 'बुजुर्गों हेतु व्हीलचेयर रैंप व निकटतम सीटिंग' : 'Elder & Mobility Accessibility'}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#6B4226', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
                    {isHindi
                      ? 'मंडप और स्टेज तक बिना सीढ़ियों वाला रैंप, तथा भोजन क्षेत्र से 20 मीटर के भीतर आरक्षित टेबल।'
                      : 'Step-free ramp to main mandap stage, plus reserved seating within 20m of dining and clean washrooms.'}
                  </p>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={config.backups.elderlyWheelchairAccess}
                      onChange={(e) => setConfig((prev) => ({ ...prev, backups: { ...prev.backups, elderlyWheelchairAccess: e.target.checked } }))}
                    />
                    <span>{isHindi ? 'सुगमता प्रोटोकॉल लागू' : 'Elder Accessibility Ramp Verified'}</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            background: 'rgba(251, 247, 240, 0.95)',
            borderTop: '1px solid rgba(234, 88, 12, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.825rem', color: '#6B4226', fontWeight: 600 }}>
            🇮🇳 {isHindi ? 'मुद्रा: भारतीय रुपया (INR ₹) • सभी गणनाएं शुद्ध अंकगणित पर आधारित' : 'Currency: Indian Rupee (INR ₹) • Sum(items) === 100%'}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.875rem' }}
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-primary"
              style={{ padding: '0.55rem 1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Sparkles size={16} />
              <span>{isHindi ? 'भारतीय इंटेलिजेंस सहेजें' : 'Save Indian Intelligence'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
