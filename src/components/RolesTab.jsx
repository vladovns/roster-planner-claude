import React from 'react';
import { ShieldCheck, Plus, Trash2, Pencil } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { DAY_NUMBERS } from '../utils/helpers';

export default function RolesTab() {
  const {
    t, roles, shifts, newRolePref, setNewRolePref,
    addRole, removeRole, setEditingRole,
  } = useRoster();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('roles_and_rules')}</h2>
          <p className="text-sm text-slate-500">{t('define_roles')}</p>
        </div>
        <ShieldCheck className="w-8 h-8 text-indigo-100" />
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <form onSubmit={addRole} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="flex-[2] min-w-[180px]">
              <label className="block text-xs font-medium text-slate-700 mb-1">{t('role_name')}</label>
              <input type="text" name="name" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-xs font-medium text-slate-700 mb-1">{t('priority_target')}</label>
              <select name="preferenceType" value={newRolePref} onChange={e => setNewRolePref(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                <option value="flexible">{t('flexible')}</option>
                <option value="mainly">{t('mainly')}</option>
                <option value="only">{t('only')}</option>
              </select>
            </div>
            {newRolePref !== 'flexible' ? (
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs font-medium text-slate-700 mb-1">{t('preferred_shift')}</label>
                <select name="preferredShiftId" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">{t('hard_exclusions')}</label>
              <div className="flex flex-wrap gap-2">
                {shifts.length === 0 ? <span className="text-xs text-slate-400">{t('no_shifts')}</span> : null}
                {shifts.map(s => (
                  <label key={s.id} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                    <input type="checkbox" name="excludedShifts" value={s.id} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">{t('fixed_days_off')}</label>
              <div className="flex flex-wrap gap-2">
                {DAY_NUMBERS.map(dayNum => (
                  <label key={`fd-${dayNum}`} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                    <input type="checkbox" name="fixedDaysOff" value={dayNum} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    {t(`day_${dayNum}`)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium text-sm">
              <Plus className="w-4 h-4" /> {t('create_roles')}
            </button>
          </div>
        </form>
      </div>

      <ul className="divide-y divide-slate-200">
        {roles.length === 0 ? (
          <li className="p-6 text-center text-slate-500">{t('no_roles')}</li>
        ) : roles.map(role => {
          const prefShift = role.preferredShiftId ? shifts.find(s => s.id === role.preferredShiftId) : null;
          const excludedNames = role.excludedShiftIds?.map(id => shifts.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '-';
          const fixedDaysNames = role.fixedDaysOff?.map(dNum => t(`day_${dNum}`)).join(', ') || '-';

          return (
            <li key={role.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> {role.name}
                </p>
                <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                  <p>
                    <span className="font-medium text-slate-700">{t('assignment_rule')}: </span>
                    {role.preferenceType === 'flexible' ? t('flexible') :
                     role.preferenceType === 'mainly' ? `${t('mainly')} (${prefShift?.name || '?'})` :
                     `${t('only')} (${prefShift?.name || '?'})`}
                  </p>
                  {role.excludedShiftIds?.length > 0 ? (
                    <p className="text-red-600"><span className="font-medium">{t('exclusions')}:</span> {excludedNames}</p>
                  ) : null}
                  {role.fixedDaysOff?.length > 0 ? (
                    <p className="text-green-600"><span className="font-medium">{t('fixed_days_off')}</span> {fixedDaysNames}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                <button onClick={() => setEditingRole(role)} className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => removeRole(role.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
