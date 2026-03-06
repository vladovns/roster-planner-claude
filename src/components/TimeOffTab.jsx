import React from 'react';
import { Sun, Plus, Trash2, Thermometer, Heart, Gift } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { getDayOfWeekShort, formatDateDDMMYYYY } from '../utils/helpers';

export default function TimeOffTab() {
  const {
    t, language, members, timeOff, timeOffError,
    addTimeOff, removeTimeOffEntry,
  } = useRoster();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('leaves_holidays')}</h2>
          <p className="text-sm text-slate-500">{t('book_holidays')}</p>
        </div>
        <Sun className="w-8 h-8 text-indigo-100" />
      </div>

      <div className="p-6 bg-slate-50">
        {timeOffError ? (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm flex items-center gap-2">
            <span className="font-bold">{t('conflict')}:</span> {timeOffError}
          </div>
        ) : null}
        <form onSubmit={addTimeOff} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <select name="memberId" required className="flex-[2] min-w-[180px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
              <option value="">Select...</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <select name="type" required className="flex-1 min-w-[140px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
              <option value="holiday">{t('holiday')}</option>
              <option value="sick">{t('sick_day')}</option>
              <option value="wish">{t('wish_day')}</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('start_date')}</label>
              <input type="date" name="startDate" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">{t('end_date')}</label>
              <input type="date" name="endDate" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <button type="submit" className="flex-none whitespace-nowrap bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium text-sm h-[38px]">
              <Plus className="w-4 h-4" /> {t('book')}
            </button>
          </div>
        </form>
      </div>

      <ul className="divide-y divide-slate-200">
        {Object.keys(timeOff).length === 0 ? (
          <li className="p-6 text-center text-slate-500">{t('no_time_off')}</li>
        ) : Object.entries(timeOff).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([dateKey, offObj]) => {
          return Object.entries(offObj).map(([memberId, type]) => {
            const member = members.find(m => m.id === memberId);
            if (!member) return null;
            const [y, m, d] = dateKey.split('-').map(Number);
            const dayName = getDayOfWeekShort(y, m - 1, d, language);

            return (
              <li key={`${dateKey}-${memberId}`} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member.color}`}>
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{dayName}, {formatDateDDMMYYYY(dateKey)}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      {type === 'holiday' ? <Sun className="w-3 h-3 text-orange-500" /> : type === 'sick' ? <Thermometer className="w-3 h-3 text-red-500" /> : <Heart className="w-3 h-3 text-pink-500" />}
                      {member.name} ({type === 'holiday' ? t('holiday') : type === 'sick' ? t('sick_day') : t('wish_day')})
                    </p>
                  </div>
                </div>
                <button onClick={() => removeTimeOffEntry(dateKey, memberId)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
              </li>
            );
          });
        })}
      </ul>
    </div>
  );
}
