import React from 'react';
import {
  Calendar, Users, Clock, ShieldCheck, Sun, Globe, Download, Upload,
} from 'lucide-react';
import { useRoster } from '../context/RosterContext';

const TAB_CONFIG = [
  { key: 'roster', icon: Calendar, label: 'monthly_roster' },
  { key: 'team', icon: Users, label: 'manage_team' },
  { key: 'shifts', icon: Clock, label: 'manage_shifts' },
  { key: 'roles', icon: ShieldCheck, label: 'roles_rules' },
  { key: 'timeoff', icon: Sun, label: 'leaves_holidays' },
];

export default function Header() {
  const { t, language, setLanguage, activeTab, setActiveTab, downloadBackup, uploadBackup } = useRoster();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-900">{t('app_title')}</h1>
        </div>

        <nav className="flex space-x-1 sm:space-x-4 shrink-0 flex-1">
          {TAB_CONFIG.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === key ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="hidden sm:inline">{t(label)}</span>
              <Icon className="w-5 h-5 sm:hidden" title={t(label)} />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-4">
          <button onClick={downloadBackup} className="text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-1.5 px-3 rounded-md transition flex items-center gap-2 hidden lg:flex" title={t('save_backup')}>
            <Download className="w-4 h-4" /> <span>{t('save_backup')}</span>
          </button>
          <label className="cursor-pointer text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-1.5 px-3 rounded-md transition flex items-center gap-2 hidden lg:flex" title={t('load_backup')}>
            <Upload className="w-4 h-4" /> <span>{t('load_backup')}</span>
            <input type="file" accept=".json" onChange={uploadBackup} className="hidden" />
          </label>
          <Globe className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
        </div>
      </div>
    </header>
  );
}
