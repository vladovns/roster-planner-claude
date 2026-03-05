import React from 'react';
import { Users, UserPlus, Trash2, Pencil, ShieldCheck, Calendar, Gift, Sun, ChevronUp, ChevronDown } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { formatDateDDMMYYYY, DEFAULT_HOLIDAY_ALLOWANCE } from '../utils/helpers';

export default function TeamTab() {
  const {
    t, roles, members,
    addMember, removeMember, moveMemberUp, moveMemberDown,
    setEditingMember, getHolidaysUsed,
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

      <div className="p-6 bg-slate-50">
        <form onSubmit={addMember} className="flex flex-col lg:flex-row flex-wrap gap-3">
          <input type="text" name="name" placeholder={t('full_name')} required className="flex-[2] min-w-[200px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900" />
          <select name="role" required className="flex-1 min-w-[130px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
            {roles.length === 0 ? <option value="">{t('add_roles_first')}</option> : null}
            {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
          <input type="number" name="maxDaysOff" placeholder={t('max_days_off')} title={t('max_days_off')} min="0" max="31" className="flex-1 min-w-[110px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-700" />
          <input type="number" name="holidayAllowance" placeholder={t('holiday_allowance')} title={t('holiday_allowance')} min="0" max="365" defaultValue={DEFAULT_HOLIDAY_ALLOWANCE} className="flex-1 min-w-[110px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-700" />
          <input type="date" name="birthday" title={t('birthday')} className="flex-1 min-w-[140px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-500" />
          <button type="submit" disabled={roles.length === 0} className="flex-none whitespace-nowrap bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2 font-medium text-sm">
            <UserPlus className="w-4 h-4 shrink-0" /> {t('add')}
          </button>
        </form>
      </div>

      <ul className="divide-y divide-slate-200">
        {members.length === 0 ? (
          <li className="p-6 text-center text-slate-500">{t('no_team_members')}</li>
        ) : members.map((member, index) => (
          <li key={member.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.color}`}>
                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{member.name}</p>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-0.5">
                  <span className="font-medium px-2 py-0.5 bg-slate-100 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" /> {member.role}
                  </span>
                  {member.maxDaysOff ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500" /> {member.maxDaysOff} {t('max_days_off')}</span> : null}
                  {member.birthday ? <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-indigo-400" /> {formatDateDDMMYYYY(member.birthday)}</span> : null}
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-orange-400" /> {getHolidaysUsed(member.id)} / {member.holidayAllowance || DEFAULT_HOLIDAY_ALLOWANCE} Days</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-col mr-2 ml-2 border-l border-slate-200 pl-2">
                <button onClick={() => moveMemberUp(index)} disabled={index === 0} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 transition"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveMemberDown(index)} disabled={index === members.length - 1} className="text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 p-1 transition"><ChevronDown className="w-4 h-4" /></button>
              </div>
              <button onClick={() => setEditingMember(member)} className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><Pencil className="w-5 h-5" /></button>
              <button onClick={() => removeMember(member.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
