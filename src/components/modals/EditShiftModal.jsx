import React from 'react';
import { X } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';
import { DAY_NUMBERS } from '../../utils/helpers';

export default function EditShiftModal() {
  const { t, editingShift, setEditingShift, updateShift } = useRoster();

  if (!editingShift) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">{t('edit_shift')}</h3>
          <button onClick={() => setEditingShift(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={updateShift} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('shift_name')}</label>
            <input type="text" name="name" defaultValue={editingShift.name} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('time_example')}</label>
            <input type="text" name="time" defaultValue={editingShift.time} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('shift_color')}</label>
            <input type="color" name="color" defaultValue={editingShift.color} className="h-10 w-14 p-1 rounded-lg border border-slate-300 shadow-sm bg-white cursor-pointer" />
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('edit_shift_targets')}</label>
            <div className="flex gap-2">
              {DAY_NUMBERS.map(d => (
                <div key={`req_edit_${d}`} className="flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 font-medium mb-1 uppercase">{t(`day_${d}`)}</span>
                  <input type="number" min="0" name={`req_${d}`} defaultValue={editingShift.requirements?.[d] ?? 1} className="w-10 sm:w-12 p-1 text-center text-sm border border-slate-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setEditingShift(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium text-sm">{t('cancel')}</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">{t('save_changes')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
