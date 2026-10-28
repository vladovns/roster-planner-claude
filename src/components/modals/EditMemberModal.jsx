import React from 'react';
import { X } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';

const fieldClass = "h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "mb-1.5 block text-xs font-semibold tracking-wide text-slate-600";

export default function EditMemberModal() {
  const { t, editingMember, setEditingMember, roles, updateMember } = useRoster();

  if (!editingMember) return null;

  const employmentPercentage = Number.isFinite(Number(editingMember.employmentPercentage)) &&
    Number(editingMember.employmentPercentage) >= 1 &&
    Number(editingMember.employmentPercentage) <= 100
    ? Number(editingMember.employmentPercentage)
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="my-auto flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{t('edit_team_member')}</h3>
          <button type="button" onClick={() => setEditingMember(null)} aria-label={t('cancel')} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={updateMember} className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <div className="min-w-0 sm:col-span-2">
            <label htmlFor="edit-member-name" className={labelClass}>{t('full_name')}</label>
            <input id="edit-member-name" type="text" name="name" defaultValue={editingMember.name} required className={fieldClass} />
          </div>

          <div className="min-w-0">
            <label htmlFor="edit-member-role" className={labelClass}>{t('role')}</label>
            <select id="edit-member-role" name="role" defaultValue={editingMember.role} required className={fieldClass} disabled={roles.length === 0}>
              {roles.length === 0 ? <option value="">{t('add_roles_first')}</option> : null}
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div className="min-w-0">
            <label htmlFor="edit-member-max-days-off" className={labelClass}>{t('max_days_off')}</label>
            <input id="edit-member-max-days-off" type="number" min="0" max="31" name="maxDaysOff" defaultValue={editingMember.maxDaysOff || ''} className={fieldClass} />
          </div>

          <div className="min-w-0">
            <label htmlFor="edit-member-employment-percentage" className={labelClass}>{t('employment_percentage')}</label>
            <div className="flex h-10 w-full min-w-0 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <input id="edit-member-employment-percentage" type="number" name="employmentPercentage" defaultValue={employmentPercentage} min="1" max="100" step="1" required className="h-full w-full min-w-0 border-0 bg-transparent px-3 text-sm text-slate-700 focus:outline-none focus:ring-0" />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">%</span>
            </div>
          </div>

          <div className="min-w-0">
            <label htmlFor="edit-member-birthday" className={labelClass}>{t('birthday')}</label>
            <input id="edit-member-birthday" type="date" name="birthday" defaultValue={editingMember.birthday || ''} className={fieldClass} />
          </div>

          <div className="min-w-0 sm:col-span-2">
            <label htmlFor="edit-member-allocation" className={labelClass}>{t('allocation_option')}</label>
            <select id="edit-member-allocation" name="allocationOption" defaultValue={editingMember.allocationOption || ''} className={fieldClass}>
              <option value="">{t('allocation_none')}</option>
              <option value="1">{t('allocation_option_1')}</option>
              <option value="2">{t('allocation_option_2')}</option>
            </select>
            {editingMember.allocationOption === '1' || editingMember.allocationOption === '2' ? (
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                {editingMember.allocationOption === '1' ? t('allocation_option_1_hint') : t('allocation_option_2_hint')}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 pt-2 sm:col-span-2">
            <button type="button" onClick={() => setEditingMember(null)} className="h-10 rounded-lg px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100">{t('cancel')}</button>
            <button type="submit" className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200">{t('save_changes')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
