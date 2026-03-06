import React from 'react';
import { X } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { DAY_NUMBERS } from '../../utils/helpers';

export default function EditRoleModal() {
  const { t, editingRole, setEditingRole, shifts, updateRole } = useRoster();

  if (!editingRole) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">{t('edit_role')}</h3>
          <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={updateRole} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('role_name')}</label>
            <input type="text" name="name" defaultValue={editingRole.name} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('priority_target')}</label>
            <select name="preferenceType" value={editingRole.preferenceType} onChange={e => setEditingRole({ ...editingRole, preferenceType: e.target.value })} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
              <option value="flexible">{t('flexible')}</option>
              <option value="mainly">{t('mainly')}</option>
              <option value="only">{t('only')}</option>
            </select>
          </div>
          {editingRole.preferenceType !== 'flexible' ? (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('preferred_shift')}</label>
              <select name="preferredShiftId" defaultValue={editingRole.preferredShiftId} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('hard_exclusions')}</label>
              <div className="flex flex-wrap gap-2">
                {shifts.length === 0 ? <span className="text-xs text-slate-400">{t('no_shifts')}</span> : null}
                {shifts.map(s => (
                  <label key={s.id} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                    <input type="checkbox" name="excludedShifts" value={s.id} defaultChecked={editingRole.excludedShiftIds?.includes(s.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t('fixed_days_off')}</label>
              <div className="flex flex-wrap gap-2">
                {DAY_NUMBERS.map(dayNum => (
                  <label key={`fd-${dayNum}`} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                    <input type="checkbox" name="fixedDaysOff" value={dayNum} defaultChecked={(editingRole.fixedDaysOff || []).map(String).includes(String(dayNum))} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    {t(`day_${dayNum}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setEditingRole(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium text-sm">{t('cancel')}</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">{t('save_changes')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
