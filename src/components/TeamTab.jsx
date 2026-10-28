import React from 'react';
import { Users, UserPlus, Trash2, Pencil, ShieldCheck, Calendar, Gift, ChevronUp, ChevronDown, Clock } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { formatDateDDMMYYYY } from '../utils/helpers';

const fieldClass = "h-10 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";
const labelClass = "text-xs font-semibold tracking-wide text-slate-600";

export default function TeamTab() {
  const {
    t, roles, members,
    addMember, removeMember, moveMemberUp, moveMemberDown,
    setEditingMember,
  } = useRoster();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('team_members')}</h2>
          <p className="text-sm text-slate-500">{t('add_remove_personnel')}</p>
        </div>
        <Users className="w-8 h-8 text-indigo-100" />
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <form onSubmit={addMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-member-name" className={labelClass}>{t('full_name')}</label>
            <input id="new-member-name" type="text" name="name" placeholder={t('full_name')} required className={fieldClass + " text-slate-900"} />
          </div>

          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-member-role" className={labelClass}>{t('role')}</label>
            <select id="new-member-role" name="role" required className={fieldClass} disabled={roles.length === 0}>
              {roles.length === 0 ? <option value="">{t('add_roles_first')}</option> : null}
              {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>

          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-employment-percentage" className={labelClass}>{t('employment_percentage')}</label>
            <div className="flex h-10 w-full min-w-0 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
              <input id="new-employment-percentage" type="number" name="employmentPercentage" defaultValue="100" min="1" max="100" step="1" required aria-label={t('employment_percentage')} className="h-full w-full min-w-0 border-0 bg-transparent px-3 text-sm text-slate-700 focus:outline-none focus:ring-0" />
              <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">%</span>
            </div>
          </div>

          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-member-max-days-off" className={labelClass}>{t('max_days_off')}</label>
            <input id="new-member-max-days-off" type="number" name="maxDaysOff" min="0" max="31" placeholder="—" className={fieldClass} />
          </div>

          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-member-allocation" className={labelClass}>{t('allocation_option')}</label>
            <select id="new-member-allocation" name="allocationOption" className={fieldClass}>
              <option value="">{t('allocation_none')}</option>
              <option value="1" title={t('allocation_option_1_hint')}>{t('allocation_option_1')}</option>
              <option value="2" title={t('allocation_option_2_hint')}>{t('allocation_option_2')}</option>
            </select>
          </div>

          <div className="min-w-0 flex flex-col gap-1.5">
            <label htmlFor="new-member-birthday" className={labelClass}>{t('birthday')}</label>
            <input id="new-member-birthday" type="date" name="birthday" className={fieldClass} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-1">
            <button type="submit" disabled={roles.length === 0} className="h-10 w-full sm:w-auto min-w-36 whitespace-nowrap rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4 shrink-0" /> {t('add')}
            </button>
          </div>
        </form>
      </div>

      <ul className="divide-y divide-slate-200">
        {members.length === 0 ? (
          <li className="p-6 text-center text-sm text-slate-500">{t('no_team_members')}</li>
        ) : members.map((member, index) => (
          <li key={member.id} className="p-4 sm:px-6 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors group">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${member.color}`}>
                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 break-words">{member.name}</p>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="font-medium px-2 py-0.5 bg-slate-100 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" /> {member.role}
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-indigo-400" /> {t('employment_percentage_short')}: {Number.isFinite(Number(member.employmentPercentage)) && Number(member.employmentPercentage) >= 1 && Number(member.employmentPercentage) <= 100 ? Number(member.employmentPercentage) : 100}%</span>
                  {member.allocationOption ? <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md">{member.allocationOption === '1' ? t('allocation_option_1') : t('allocation_option_2')}</span> : null}
                  {member.maxDaysOff ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> {member.maxDaysOff} {t('max_days_off')}</span> : null}
                  {member.birthday ? <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-indigo-400" /> {formatDateDDMMYYYY(member.birthday)}</span> : null}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <div className="flex flex-col mr-1 ml-1 border-l border-slate-200 pl-2">
                <button type="button" onClick={() => moveMemberUp(index)} disabled={index === 0} aria-label={`Move ${member.name} up`} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 transition"><ChevronUp className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveMemberDown(index)} disabled={index === members.length - 1} aria-label={`Move ${member.name} down`} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 transition"><ChevronDown className="w-4 h-4" /></button>
              </div>
              <button type="button" onClick={() => setEditingMember(member)} aria-label={`Edit ${member.name}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><Pencil className="w-5 h-5" /></button>
              <button type="button" onClick={() => removeMember(member.id)} aria-label={`Remove ${member.name}`} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
