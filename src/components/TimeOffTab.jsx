import React, { useState } from 'react';
import { Sun, Plus, Trash2, Thermometer, Heart, CalendarCheck, DollarSign, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { getDayOfWeekShort, formatDateDDMMYYYY } from '../utils/helpers';

function getTypeIcon(type, events) {
  if (type === 'holiday') return <Sun className="w-3 h-3 text-orange-500" />;
  if (type === 'sick') return <Thermometer className="w-3 h-3 text-red-500" />;
  if (type === 'wish') return <Heart className="w-3 h-3 text-pink-500" />;
  if (type === 'unpaid') return <DollarSign className="w-3 h-3 text-amber-600" />;
  if (type?.startsWith('event_')) return <CalendarCheck className="w-3 h-3 text-teal-500" />;
  return null;
}

function getTypeLabel(type, t, events) {
  if (type === 'holiday') return t('holiday');
  if (type === 'sick') return t('sick_day');
  if (type === 'wish') return t('wish_day');
  if (type === 'unpaid') return t('unpaid_leave');
  if (type?.startsWith('event_')) {
    const eventId = type.replace('event_', '');
    const ev = events.find(e => e.id === eventId);
    return ev ? ev.name : t('event');
  }
  return type;
}

export default function TimeOffTab() {
  const {
    t, language, members, timeOff, timeOffError,
    addTimeOff, removeTimeOffEntry,
    events, addEvent, removeEvent,
  } = useRoster();

  const [eventsExpanded, setEventsExpanded] = useState(events.length === 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 1. Custom Events — collapsible, at the top */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setEventsExpanded(prev => !prev)}
          className="w-full p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-semibold text-slate-900">{t('events')}</h2>
              {!eventsExpanded && events.length > 0 && (
                <p className="text-xs text-slate-400">{events.length} {events.length === 1 ? t('event') : t('events').toLowerCase()}: {events.map(ev => ev.name).join(', ')}</p>
              )}
              {!eventsExpanded && events.length === 0 && (
                <p className="text-xs text-slate-400">{t('no_events')}</p>
              )}
            </div>
          </div>
          {eventsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {eventsExpanded && (
          <>
            <div className="p-4 sm:p-6 bg-slate-50">
              <form onSubmit={addEvent} className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <input type="text" name="eventName" required placeholder={t('event_name')} className="flex-[2] min-w-[180px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white" />
                  <input type="number" name="eventHours" required min="0.5" max="24" step="0.5" placeholder={t('event_hours')} className="flex-1 min-w-[120px] rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white" />
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                    <input type="checkbox" name="countsAsWorkDay" className="rounded text-teal-600 focus:ring-teal-500" />
                    {t('counts_as_work_day')}
                  </label>
                  <button type="submit" className="flex-none whitespace-nowrap bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2 font-medium text-sm h-[38px]">
                    <Plus className="w-4 h-4" /> {t('create_event')}
                  </button>
                </div>
              </form>
            </div>

            {events.length > 0 && (
              <ul className="divide-y divide-slate-200">
                {events.map(ev => (
                  <li key={ev.id} className="p-3 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <CalendarCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ev.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.hours}h</span>
                          {ev.countsAsWorkDay && (
                            <span className="text-teal-600 font-medium">• {t('counts_as_work_day')}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => removeEvent(ev.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-4 h-4" /></button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* 2. Book Time Off */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                <option value="unpaid">{t('unpaid_leave')}</option>
                {events.length > 0 && <option disabled>──────────</option>}
                {events.map(ev => (
                  <option key={ev.id} value={`event_${ev.id}`}>{ev.name} ({ev.hours}h)</option>
                ))}
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

        {/* 3. Bookings List */}
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
                        {getTypeIcon(type, events)}
                        {member.name} ({getTypeLabel(type, t, events)})
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
    </div>
  );
}
