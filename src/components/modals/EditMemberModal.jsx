import React from 'react';
import { X } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { DEFAULT_HOLIDAY_ALLOWANCE } from '../../utils/helpers';

export default function EditMemberModal() {
  const { t, editingMember, setEditingMember, roles, updateMember } = useRoster();

  if (!editingMember) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">{t('edit_team_member')}</h3>
          <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={updateMember} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('full_name')}</label>
            <input type="text" name="name" defaultValue={editingMember.name} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('role')}</label>
              <select name="role" defaultValue={editingMember.role} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                {roles.length === 0 ? <option value="">{t('add_roles_first')}</option> : null}
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('max_days_off')}</label>
              <input type="number" min="0" max="31" name="maxDaysOff" defaultValue={editingMember.maxDaysOff || ''} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-700" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('birthday')}</label>
              <input type="date" name="birthday" defaultValue={editingMember.birthday} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-500" />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('holiday_allowance')}</label>
              <input type="number" min="0" max="365" name="holidayAllowance" defaultValue={editingMember.holidayAllowance || DEFAULT_HOLIDAY_ALLOWANCE} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-700" />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium text-sm">{t('cancel')}</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">{t('save_changes')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
