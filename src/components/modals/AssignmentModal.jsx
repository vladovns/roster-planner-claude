import React from 'react';
import { X } from 'lucide-react';
import { useRoster } from '../../context/RosterContext';

export default function AssignmentModal() {
  const { t, editingCell, setEditingCell, members, shifts, handleCellUpdate } = useRoster();

  if (!editingCell) return null;

  const member = members.find(m => m.id === editingCell.memberId);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{editingCell.dateLabel}</h3>
            <p className="text-sm text-slate-500">{t('assign_shift_for')} {member?.name}</p>
          </div>
          <button onClick={() => setEditingCell(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <button
              onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, null)}
              className={`p-3 rounded-lg border text-sm font-medium transition-colors ${!editingCell.currentShiftId && !editingCell.currentOffType ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-200 text-green-600 hover:bg-green-50'}`}
            >
              {t('off')} <br /><span className="text-[10px] font-normal opacity-70">{t('rest_day')}</span>
            </button>
            <button
              onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'holiday')}
              className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'holiday' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-orange-600 hover:bg-orange-50'}`}
            >
              HOL <br /><span className="text-[10px] font-normal opacity-70 text-slate-500">{t('holiday')}</span>
            </button>
            <button
              onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'sick')}
              className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'sick' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-red-600 hover:bg-red-50'}`}
            >
              {t('sick')} <br /><span className="text-[10px] font-normal opacity-70 text-slate-500">{t('sick_leave')}</span>
            </button>
            <button
              onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'wish')}
              className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'wish' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-slate-200 text-pink-600 hover:bg-pink-50'}`}
            >
              WSH <br /><span className="text-[10px] font-normal opacity-70 text-slate-500">{t('wish_day')}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {shifts.map(s => (
              <button
                key={s.id}
                onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, s.id, null)}
                style={editingCell.currentShiftId === s.id ? { backgroundColor: s.color + '1A', borderColor: s.color, color: s.color } : { color: s.color }}
                className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentShiftId === s.id ? 'border-2' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                {s.name} <br /><span className="text-[10px] font-normal opacity-70">{s.time}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button onClick={() => setEditingCell(null)} className="w-full bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition font-medium text-sm shadow-sm">
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
