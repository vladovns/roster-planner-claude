import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Wand2, Printer, Loader2, Clock, Users,
} from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { useAutoScheduler } from '../hooks/useAutoScheduler';
import { getDayOfWeekShort, getDateKey, calculateShiftDuration } from '../utils/helpers';
import { langMap } from '../utils/translations';

export default function RosterTab() {
  const {
    t, language, getDayOfWeekShortLocale,
    members, shifts, roles, timeOff, events,
    currentDate, currentYear, currentMonth, daysArray,
    assignments, setAssignments,
    minTwoDaysOff, setMinTwoDaysOff,
    isExporting, setIsExporting,
    prevMonth, nextMonth, clearMonth,
    getMemberShiftOnDate, getMonthlyStats, coverageAlerts,
    setEditingCell, setActiveTab,
  } = useRoster();

  const autoSchedule = useAutoScheduler();
  const [confirmClear, setConfirmClear] = useState(false);
  const [showUnderstaffed, setShowUnderstaffed] = useState(true);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const element = document.getElementById('roster-content-to-print');
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '-9999px';
      wrapper.style.width = '1200px';
      wrapper.style.display = 'block';
      document.body.appendChild(wrapper);

      const clone = element.cloneNode(true);

      const pdfTitle = document.createElement('h2');
      const monthYear = currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' });
      pdfTitle.innerText = `${t('monthly_roster')} - ${monthYear}`;
      pdfTitle.style.fontSize = '24px';
      pdfTitle.style.fontWeight = 'bold';
      pdfTitle.style.marginBottom = '20px';
      pdfTitle.style.paddingBottom = '10px';
      pdfTitle.style.borderBottom = '2px solid #e2e8f0';
      pdfTitle.style.color = '#0f172a';
      pdfTitle.style.textTransform = 'capitalize';
      pdfTitle.style.fontFamily = 'system-ui, sans-serif';
      // Build stats bar for PDF
      const totalDays = daysArray.length;
      const understaffedDays = Object.keys(coverageAlerts).length;
      const fullyStaffedDays = totalDays - understaffedDays;
      const totalShiftsAssigned = daysArray.reduce((sum, day) => {
        const dk = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return sum + shifts.reduce((s, sh) => s + (assignments[dk]?.[sh.id]?.length || 0), 0);
      }, 0);

      const pdfStats = document.createElement('div');
      pdfStats.style.display = 'flex';
      pdfStats.style.gap = '24px';
      pdfStats.style.flexWrap = 'wrap';
      pdfStats.style.fontSize = '11px';
      pdfStats.style.marginBottom = '12px';
      pdfStats.style.paddingBottom = '10px';
      pdfStats.style.borderBottom = '1px solid #e2e8f0';
      pdfStats.style.fontFamily = 'system-ui, sans-serif';
      pdfStats.style.color = '#475569';

      const statItems = [
        { dot: '#34d399', label: `${t('fully_staffed')}:`, value: `${fullyStaffedDays} / ${totalDays} ${t('days')}`, color: '#059669' },
        ...(understaffedDays > 0 ? [{ dot: '#fbbf24', label: `${t('understaffed')}:`, value: `${understaffedDays} ${t('days')}`, color: '#d97706' }] : []),
        { dot: '#818cf8', label: `${t('shifts_assigned')}:`, value: `${totalShiftsAssigned}`, color: '#4338ca' },
        { dot: '#94a3b8', label: `${t('team_members')}:`, value: `${members.length}`, color: '#334155' },
      ];

      statItems.forEach(item => {
        const span = document.createElement('span');
        span.style.display = 'flex';
        span.style.alignItems = 'center';
        span.style.gap = '5px';
        span.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${item.dot};display:inline-block;flex-shrink:0"></span><span>${item.label}</span><strong style="color:${item.color}">${item.value}</strong>`;
        pdfStats.appendChild(span);
      });

      clone.insertBefore(pdfStats, clone.firstChild);
      clone.insertBefore(pdfTitle, clone.firstChild);

      clone.classList.remove('flex', 'flex-col', 'flex-1', 'min-h-0', 'overflow-hidden');
      clone.classList.add('block');
      clone.style.overflow = 'visible';
      clone.style.width = '100%';
      clone.style.height = 'auto';
      clone.style.backgroundColor = 'white';
      clone.style.padding = '20px';

      const scrollableDiv = clone.querySelector('.overflow-x-auto');
      if (scrollableDiv) {
        scrollableDiv.classList.remove('flex-1');
        scrollableDiv.style.overflow = 'visible';
        scrollableDiv.style.width = '100%';
        scrollableDiv.style.height = 'auto';
      }

      const tableEl = clone.querySelector('table');
      if (tableEl) {
        tableEl.classList.remove('min-w-[768px]');
        tableEl.style.width = '100%';
        tableEl.style.height = 'auto';
        // Switch to border-separate so cell backgrounds don't paint over borders
        tableEl.style.borderCollapse = 'separate';
        tableEl.style.borderSpacing = '0';
      }

      // Force consistent 1px solid black borders on every cell
      clone.querySelectorAll('td, th').forEach(el => {
        el.style.border = '1px solid black';
      });

      // Force background colors for day headers (html2canvas doesn't always pick up Tailwind classes)
      clone.querySelectorAll('th.bg-amber-100').forEach(el => {
        el.style.backgroundColor = '#fef3c7';
        el.style.color = '#92400e';
      });
      clone.querySelectorAll('th.bg-blue-100').forEach(el => {
        el.style.backgroundColor = '#dbeafe';
        el.style.color = '#1e3a8a';
      });

      // Force background colors for colored body cells
      clone.querySelectorAll('td.bg-orange-50').forEach(el => { el.style.backgroundColor = '#fff7ed'; });
      clone.querySelectorAll('td.bg-red-50').forEach(el => { el.style.backgroundColor = '#fef2f2'; });
      clone.querySelectorAll('td.bg-pink-50').forEach(el => { el.style.backgroundColor = '#fdf2f8'; });
      clone.querySelectorAll('td.bg-amber-50').forEach(el => { el.style.backgroundColor = '#fffbeb'; });
      clone.querySelectorAll('td.bg-indigo-50').forEach(el => { el.style.backgroundColor = '#eef2ff'; });
      clone.querySelectorAll('td.bg-teal-50').forEach(el => { el.style.backgroundColor = '#f0fdfa'; });
      clone.querySelectorAll('td.bg-blue-50\\/60').forEach(el => { el.style.backgroundColor = '#eff6ff'; });
      clone.querySelectorAll('td.bg-slate-100').forEach(el => { el.style.backgroundColor = '#f1f5f9'; });

      wrapper.appendChild(clone);

      const opt = {
        margin: 0.2,
        filename: `Team_Roster_${currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' })}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };

      await window.html2pdf().set(opt).from(clone).save();
      document.body.removeChild(wrapper);
    } catch (error) {
      console.error("PDF Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] print:block print:h-auto print:overflow-visible print:border-none print:shadow-none">
      {/* Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 print:bg-white print:border-none print:p-0 print:mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm print:border-none print:shadow-none">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-l-lg border-r border-slate-300 print:hidden"><ChevronLeft className="w-5 h-5" /></button>
            <div className="px-4 py-2 font-semibold text-slate-800 min-w-[150px] text-center print:text-2xl print:px-0 print:text-left capitalize">
              {currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-r-lg border-l border-slate-300 print:hidden"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 hidden xl:block print:hidden">{t('monthly_schedule')}</h2>
        </div>
        <div className="flex gap-2 self-start sm:self-auto flex-wrap print:hidden items-center">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-md cursor-pointer transition shadow-sm" title={t('min_two_days_off')}>
            <input type="checkbox" checked={minTwoDaysOff} onChange={(e) => setMinTwoDaysOff(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="hidden lg:inline">{t('min_two_days_off')}</span>
            <span className="lg:hidden text-xs">2 Days Off</span>
          </label>
          <button onClick={exportToPDF} disabled={isExporting} className="text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-md transition flex items-center gap-2 shadow-sm disabled:opacity-50">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            <span className="hidden sm:inline">{isExporting ? t('exporting') : t('export_pdf')}</span>
          </button>
          <button onClick={autoSchedule} className="text-sm font-medium text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-4 py-1.5 rounded-md transition flex items-center gap-2 border border-teal-200 shadow-sm">
            <Wand2 className="w-4 h-4" />
            {t('auto_schedule')}
          </button>
          {confirmClear ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
              <span className="text-sm font-medium text-red-700">{t('clear_month')}?</span>
              <button
                onClick={() => { clearMonth(); setConfirmClear(false); }}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded transition"
              >
                {t('confirm')}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 px-2 py-0.5 rounded transition"
              >
                {t('cancel')}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-md transition border border-red-200 shadow-sm">
              {t('clear_month')}
            </button>
          )}
        </div>
      </div>

      {/* Overview bar */}
      {shifts.length > 0 && members.length > 0 && (() => {
        const totalDays = daysArray.length;
        const understaffedDays = Object.keys(coverageAlerts).length;
        const fullyStaffedDays = totalDays - understaffedDays;
        const totalShiftsAssigned = daysArray.reduce((sum, day) => {
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return sum + shifts.reduce((s, sh) => s + (assignments[dateKey]?.[sh.id]?.length || 0), 0);
        }, 0);
        return (
          <div className="flex flex-wrap gap-4 px-4 sm:px-6 py-2.5 bg-white border-b border-slate-100 text-xs print:hidden">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-500">{t('fully_staffed')}:</span>
              <span className="font-semibold text-emerald-600">{fullyStaffedDays} / {totalDays} {t('days')}</span>
            </div>
            {understaffedDays > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-slate-500">{t('understaffed')}:</span>
                <span className="font-semibold text-amber-600">{understaffedDays} {t('days')}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
              <span className="text-slate-500">{t('shifts_assigned')}:</span>
              <span className="font-semibold text-indigo-600">{totalShiftsAssigned}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <span className="text-slate-500">{t('team_members')}:</span>
              <span className="font-semibold text-slate-700">{members.length}</span>
            </div>
            <label className="flex items-center gap-1.5 ml-auto cursor-pointer select-none">
              <input type="checkbox" checked={showUnderstaffed} onChange={e => setShowUnderstaffed(e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
              <span className="text-slate-500">{t('highlight_understaffed')}</span>
            </label>
          </div>
        );
      })()}

      {shifts.length === 0 ? (
        <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
          <Clock className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">{t('no_shifts')}</h3>
          <button onClick={() => setActiveTab('shifts')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition mt-4">{t('manage_shifts')}</button>
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">{t('no_team_members')}</h3>
          <button onClick={() => setActiveTab('team')} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition mt-4">{t('manage_team')}</button>
        </div>
      ) : (
        <div id="roster-content-to-print" className="flex flex-col flex-1 min-h-0 overflow-hidden print:block print:h-auto print:overflow-visible bg-white">
          {/* Shifts Legend */}
          <div className="mb-4 mx-4 sm:mx-6 flex flex-wrap gap-4 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm print:mx-0 print:border-none print:shadow-none print:p-0 print:mb-2">
            <span className="text-slate-500 uppercase tracking-wider text-xs flex items-center">{t('shift_legend')}</span>
            {shifts.map(s => (
              <div key={s.id} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: s.color }}></div>
                <span className="font-bold" style={{ color: s.color }}>{s.name}</span>
                <span className="text-slate-500">({s.time})</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto flex-1 print:flex-none print:h-auto print:overflow-visible no-scrollbar">
            <table className="w-full min-w-[768px] print:min-w-0 table-fixed divide-y divide-slate-200 border-collapse text-center">
              <thead className="bg-slate-100 sticky top-0 z-20 shadow-sm">
                <tr>
                  <th rowSpan={2} className="px-2 py-2 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider w-[70px] sm:w-[120px] border-r border-slate-200 bg-slate-100 sticky left-0 z-30 shadow-[1px_0_0_0_rgba(226,232,240,1)] print:static print:shadow-none print:py-1 print:w-[80px]">
                    {t('datum')}
                  </th>
                  {daysArray.map(day => {
                    const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                    const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';
                    const dateKey = getDateKey(currentYear, currentMonth, day);
                    const isUnderstaffed = showUnderstaffed && !!coverageAlerts[dateKey];
                    const bg = isUnderstaffed ? 'bg-amber-100 text-amber-800' : isFriSat ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700';
                    return (
                      <th key={`day-${day}`} className={`p-0 h-6 sm:h-8 print:h-5 text-[10px] sm:text-sm print:text-[8px] font-bold border-b border-r border-slate-200 ${bg}`}>
                        {day}
                      </th>
                    );
                  })}
                </tr>
                <tr>
                  {daysArray.map(day => {
                    const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                    const dayOfWeekLocal = getDayOfWeekShortLocale(currentYear, currentMonth, day);
                    const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';
                    const dateKey = getDateKey(currentYear, currentMonth, day);
                    const isUnderstaffed = showUnderstaffed && !!coverageAlerts[dateKey];
                    const bg = isUnderstaffed ? 'bg-amber-100 text-amber-700' : isFriSat ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500';
                    return (
                      <th key={`dow-${day}`} className={`p-0 h-4 sm:h-5 print:h-3 text-[8px] sm:text-[10px] print:text-[7px] font-medium border-r border-slate-200 uppercase ${bg}`}>
                        {dayOfWeekLocal}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {members.map((member, idx) => (
                  <tr key={member.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="px-2 py-0 border-r border-slate-200 sticky left-0 bg-inherit shadow-[1px_0_0_0_rgba(226,232,240,1)] z-10 text-left h-9 sm:h-12 print:h-6 print:static print:shadow-none">
                      <div className="font-medium text-slate-900 text-[10px] sm:text-xs print:text-[9px] truncate max-w-[54px] sm:max-w-[104px] print:max-w-none" title={member.name}>{member.name}</div>
                    </td>
                    {daysArray.map(day => {
                      const dateKey = getDateKey(currentYear, currentMonth, day);
                      const dateObj = new Date(currentYear, currentMonth, day);
                      const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                      const dayOfWeekNum = dateObj.getDay().toString();

                      const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';

                      const assignedShiftId = getMemberShiftOnDate(dateKey, member.id);
                      const assignedShift = assignedShiftId ? shifts.find(s => s.id === assignedShiftId) : null;

                      const memberOffType = timeOff[dateKey]?.[member.id];
                      const isBirthday = member.birthday && member.birthday.substring(5) === dateKey.substring(5);

                      const mRole = roles.find(r => r.name === member.role) || { fixedDaysOff: [] };
                      const isFixedOff = (mRole.fixedDaysOff || []).map(String).includes(dayOfWeekNum);

                      let display = t('off');
                      let cellClass = 'text-green-600';
                      let baseBg = isFriSat ? 'bg-blue-50/60' : '';
                      let cellStyle = {};

                      if (isBirthday) { display = 'B-DAY'; cellClass = 'text-indigo-600 font-bold'; baseBg = 'bg-indigo-50'; }
                      else if (memberOffType === 'holiday') { display = 'HOL'; cellClass = 'text-orange-600 font-bold'; baseBg = 'bg-orange-50'; }
                      else if (memberOffType === 'sick') { display = t('sick'); cellClass = 'text-red-700 font-bold'; baseBg = 'bg-red-50'; }
                      else if (memberOffType === 'wish') { display = 'WSH'; cellClass = 'text-pink-600 font-bold'; baseBg = 'bg-pink-50'; }
                      else if (memberOffType === 'unpaid') { display = t('unpaid'); cellClass = 'text-amber-700 font-bold'; baseBg = 'bg-amber-50'; }
                      else if (memberOffType && memberOffType.startsWith('event_')) {
                        const eventDef = events.find(ev => `event_${ev.id}` === memberOffType);
                        display = eventDef ? (eventDef.abbreviation || eventDef.name.substring(0, 3).toUpperCase()) : 'EVT';
                        if (eventDef?.color) {
                          cellClass = 'font-bold';
                          cellStyle = { color: eventDef.color };
                          baseBg = '';
                        } else {
                          cellClass = 'text-teal-700 font-bold';
                          baseBg = 'bg-teal-50';
                        }
                      }
                      else if (assignedShift) {
                        display = assignedShift.name;
                        cellClass = 'font-bold';
                        cellStyle = { color: assignedShift.color };
                      } else if (isFixedOff) {
                        display = t('off');
                        cellClass = 'text-green-600';
                        baseBg = 'bg-slate-100';
                      }

                      return (
                        <td
                          key={`${dateKey}-${member.id}`}
                          onClick={() => {
                            if (isBirthday || isFixedOff) return;
                            setEditingCell({ dateKey, dateLabel: `${day} ${getDayOfWeekShortLocale(currentYear, currentMonth, day)}`, memberId: member.id, currentShiftId: assignedShiftId, currentOffType: memberOffType });
                          }}
                          className={`p-0 border-r border-slate-200 text-center text-[9px] sm:text-[11px] print:text-[8px] transition-colors ${!isBirthday && !isFixedOff ? 'cursor-pointer hover:bg-slate-200/50' : ''} ${baseBg} ${cellClass}`}
                          style={cellStyle}
                        >
                          <div className="flex items-center justify-center w-full h-9 sm:h-12 print:h-6">
                            {display}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Monthly Summary Footer — compact table */}
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 shrink-0 overflow-x-auto print:break-inside-avoid print:bg-white print:border-none print:shadow-none print:mt-4 print:p-0">
            <table className="w-full min-w-[600px] text-[10px] sm:text-xs border-collapse">
              <thead>
                <tr className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="text-left py-1 px-1 font-semibold w-[100px] sm:w-[120px]">{t('monthly_summary')}</th>
                  <th className="text-center py-1 px-1 font-semibold">{t('shifts_worked')}</th>
                  <th className="text-center py-1 px-1 font-semibold">{t('hours_worked')}</th>
                  <th className="text-center py-1 px-1 font-semibold">{t('rest_days')}</th>
                  <th className="text-center py-1 px-1 font-semibold text-orange-400">{t('holidays_taken')}</th>
                  <th className="text-center py-1 px-1 font-semibold text-red-400">{t('sick_days_taken')}</th>
                  <th className="text-center py-1 px-1 font-semibold text-pink-400">{t('wish_days_taken')}</th>
                  <th className="text-center py-1 px-1 font-semibold text-amber-400">{t('unpaid_days_taken')}</th>
                  {events.map(ev => (
                    <th key={ev.id} className="text-center py-1 px-1 font-semibold" style={{ color: ev.color || '#0f766e' }} title={ev.explanation || ev.name}>
                      {ev.abbreviation || ev.name.substring(0, 3).toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map(member => {
                  const stats = getMonthlyStats(member.id);
                  return (
                    <tr key={member.id} className="hover:bg-slate-100/50">
                      <td className="py-1 px-1 text-left">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${member.color}`}>
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900 truncate">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-1 px-1 text-center font-semibold text-slate-700">{stats.shiftsWorked}</td>
                      <td className="py-1 px-1 text-center font-semibold text-slate-700">{stats.hoursWorked}</td>
                      <td className="py-1 px-1 text-center font-semibold text-green-600">{stats.restDays}</td>
                      <td className="py-1 px-1 text-center font-semibold text-orange-600">{stats.holidays || '—'}</td>
                      <td className="py-1 px-1 text-center font-semibold text-red-600">{stats.sickDays || '—'}</td>
                      <td className="py-1 px-1 text-center font-semibold text-pink-600">{stats.wishDays || '—'}</td>
                      <td className="py-1 px-1 text-center font-semibold text-amber-600">{stats.unpaidDays || '—'}</td>
                      {events.map(ev => (
                        <td key={ev.id} className="py-1 px-1 text-center font-semibold" style={{ color: ev.color || '#0f766e' }}>
                          {stats.eventBreakdown[ev.id] || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {events.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500 border-t border-slate-200 pt-1.5">
                {events.map(ev => (
                  <span key={ev.id}>
                    <span className="font-bold" style={{ color: ev.color || '#0f766e' }}>{ev.abbreviation || ev.name.substring(0, 3).toUpperCase()}</span>
                    {' = '}
                    {ev.explanation || ev.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
