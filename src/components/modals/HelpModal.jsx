import React from 'react';
import { X, BookOpen, Users, Clock, ShieldCheck, Sun, Calendar, Zap, FileDown, HelpCircle } from 'lucide-react';

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-6">
    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 mb-2">
      <Icon className="w-5 h-5 text-indigo-500 shrink-0" />
      {title}
    </h3>
    <div className="text-sm text-slate-600 leading-relaxed space-y-2 pl-7">{children}</div>
  </div>
);

const Kbd = ({ children }) => (
  <span className="inline-block bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-700">{children}</span>
);

export default function HelpModal({ open, onClose, t }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            {t('help_title')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <p className="text-sm text-slate-500 mb-6">{t('help_intro')}</p>

          <Section icon={ShieldCheck} title={t('help_roles_title')}>
            <p>{t('help_roles_1')}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>{t('flexible')}:</strong> {t('help_roles_flexible')}</li>
              <li><strong>{t('mainly')}:</strong> {t('help_roles_mainly')}</li>
              <li><strong>{t('only')}:</strong> {t('help_roles_only')}</li>
            </ul>
            <p>{t('help_roles_2')}</p>
          </Section>

          <Section icon={Clock} title={t('help_shifts_title')}>
            <p>{t('help_shifts_1')}</p>
            <p>{t('help_shifts_2')}</p>
            <p>{t('help_shifts_3')}</p>
          </Section>

          <Section icon={Users} title={t('help_team_title')}>
            <p>{t('help_team_1')}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>{t('max_days_off')}:</strong> {t('help_team_maxoff')}</li>
              <li><strong>{t('allocation_option')}:</strong> {t('help_team_alloc')}</li>
              <li><strong>{t('birthday')}:</strong> {t('help_team_birthday')}</li>
            </ul>
          </Section>

          <Section icon={Sun} title={t('help_timeoff_title')}>
            <p>{t('help_timeoff_1')}</p>
            <p>{t('help_timeoff_2')}</p>
          </Section>

          <Section icon={Calendar} title={t('help_roster_title')}>
            <p>{t('help_roster_1')}</p>
            <p>{t('help_roster_2')}</p>
            <p>{t('help_roster_3')}</p>
          </Section>

          <Section icon={Zap} title={t('help_auto_title')}>
            <p>{t('help_auto_intro')}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>{t('help_auto_rule1')}</li>
              <li>{t('help_auto_rule2')}</li>
              <li>{t('help_auto_rule3')}</li>
              <li>{t('help_auto_rule4')}</li>
              <li>{t('help_auto_rule5')}</li>
              <li>{t('help_auto_rule6')}</li>
              <li>{t('help_auto_rule7')}</li>
            </ul>
          </Section>

          <Section icon={FileDown} title={t('help_export_title')}>
            <p>{t('help_export_1')}</p>
            <p>{t('help_export_2')}</p>
            <p>{t('help_export_3')}</p>
          </Section>

          <Section icon={HelpCircle} title={t('help_tips_title')}>
            <ul className="list-disc pl-4 space-y-1">
              <li>{t('help_tip_1')}</li>
              <li>{t('help_tip_2')}</li>
              <li>{t('help_tip_3')}</li>
              <li>{t('help_tip_4')}</li>
            </ul>
          </Section>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            {t('help_close')}
          </button>
        </div>
      </div>
    </div>
  );
}
