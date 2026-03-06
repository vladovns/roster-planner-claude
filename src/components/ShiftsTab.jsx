import React from 'react';
import { Clock, Plus, Trash2, Pencil } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { calculateShiftDuration, DAY_NUMBERS } from '../utils/helpers';

export default function ShiftsTab() {
  const {
    t, shifts, newShiftColor, setNewShiftColor,
    addShift, removeShift, setEditingShift,
  } = useRoster();

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('shift_types')}</h2>
          <p className="text-sm text-slate-500">{t('define_working_periods')}</p>
        </div>
        <Clock className="w-8 h-8 text-indigo-100" />
      </div>

      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{t('create_new_shift')}</h3>
        <form onSubmit={addShift} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <input type="text" name="name" placeholder={t('shift_name')} required className="flex-[2] min-w-[180px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
            <input type="text" name="time" placeholder={t('time_example')} required className="flex-1 min-w-[150px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
            <input type="color" name="color" value={newShiftColor} onChange={(e) => setNewShiftColor(e.target.value)} className="h-[38px] w-12 shrink-0 p-1 rounded-lg border border-slate-300 shadow-sm bg-white cursor-pointer" title={t('shift_color')} />
            <div className="flex-none w-20">
              <input type="number" name="priority" defaultValue="10" min="1" max="99" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-center" title={t('shift_priority_hint')} placeholder={t('priority')} />
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <label className="block text-xs font-medium text-slate-700 mb-2">{t('edit_shift_targets')}</label>
            <div className="flex gap-2 flex-wrap">
              {DAY_NUMBERS.map(d => (
                <div key={`req_new_${d}`} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-medium mb-1 uppercase">{t(`day_${d}`)}</span>
                  <input type="number" min="0" name={`req_${d}`} defaultValue="1" className="w-12 sm:w-14 p-1 text-center text-sm border border-slate-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">{t('shift_priority_hint')}</p>

          <div className="flex justify-end mt-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium text-sm">
              <Plus className="w-4 h-4 shrink-0" /> {t('add')}
            </button>
          </div>
        </form>
      </div>

      <ul className="divide-y divide-slate-200">
        {shifts.length === 0 ? (
          <li className="p-6 text-center text-slate-500">{t('no_shifts')}</li>
        ) : shifts.map(shift => (
          <li key={shift.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full shadow-sm border border-slate-200 shrink-0" style={{ backgroundColor: shift.color }}></div>
              <div>
                <p className="text-sm font-bold" style={{ color: shift.color }}>
                  {shift.name}
                  <span className="text-xs text-slate-400 font-normal ml-2">({t('priority')}: {shift.priority || 10})</span>
                </p>
                <p className="text-xs text-slate-500 mb-1">{shift.time} ({calculateShiftDuration(shift.time)}h net)</p>
                <div className="flex gap-1 flex-wrap">
                  {DAY_NUMBERS.map(d => (
                    <span key={`td_${d}`} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200" title={`${t(`day_${d}`)} Target`}>
                      {t(`day_${d}`)}:{shift.requirements?.[d] ?? 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 self-end sm:self-center">
              <button onClick={() => setEditingShift(shift)} className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><Pencil className="w-5 h-5" /></button>
              <button onClick={() => removeShift(shift.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
