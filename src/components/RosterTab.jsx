import React from 'react';
import {
  ChevronLeft, ChevronRight, Wand2, Printer, Loader2, Clock, Users,
  Gift, Sun, Thermometer, Heart, AlertTriangle,
} from 'lucide-react';
import { useRoster } from '../context/RosterContext';
import { useAutoScheduler } from '../hooks/useAutoScheduler';
import { getDayOfWeekShort, getDateKey, calculateShiftDuration } from '../utils/helpers';
import { langMap } from '../utils/translations';

export default function RosterTab() {
  const {
    t, language, getDayOfWeekShortLocale,
    members, shifts, roles, timeOff,
    currentDate, currentYear, currentMonth, daysArray,
    assignments, setAssignments,
    minTwoDaysOff, setMinTwoDaysOff,
    isExporting, setIsExporting,
    prevMonth, nextMonth, clearMonth,
    getMemberShiftOnDate, getMonthlyStats, coverageAlerts,
    setEditingCell, setActiveTab,
  } = useRoster();

  const autoSchedule = useAutoScheduler();

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
      }

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
          <button onClick={clearMonth} className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-md transition border border-red-200 shadow-sm">
            {t('clear_month')}
          </button>
        </div>
      </div>

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
                  <th rowSpan={2} className="px-2 py-2 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider w-[70px] sm:w-[120px] border-r border-slate-200 bg-slate-100 sticky left-0 z-30 shadow-[1px_0_0_0_rgba(226,232,240,1)]">
                    {t('datum')}
                  </th>
                  {daysArray.map(day => {
                    const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                    const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';
                    return (
                      <th key={`day-${day}`} className={`p-0 h-6 sm:h-8 text-[10px] sm:text-sm font-bold border-b border-r border-slate-200 ${isFriSat ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'}`}>
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
                    return (
                      <th key={`dow-${day}`} className={`p-0 h-4 sm:h-5 text-[8px] sm:text-[10px] font-medium border-r border-slate-200 uppercase ${isFriSat ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                        {dayOfWeekLocal}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {members.map((member, idx) => (
                  <tr key={member.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="px-2 py-0 border-r border-slate-200 sticky left-0 bg-inherit shadow-[1px_0_0_0_rgba(226,232,240,1)] z-10 text-left h-9 sm:h-12">
                      <div className="font-medium text-slate-900 text-[10px] sm:text-xs truncate max-w-[54px] sm:max-w-[104px]" title={member.name}>{member.name}</div>
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
                          className={`p-0 border-r border-slate-200 text-center text-[9px] sm:text-[11px] transition-colors ${!isBirthday && !isFixedOff ? 'cursor-pointer hover:bg-slate-200/50' : ''} ${baseBg} ${cellClass}`}
                          style={cellStyle}
                        >
                          <div className="flex items-center justify-center w-full h-9 sm:h-12">
                            {display}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Leave & Events Row */}
                <tr className="bg-slate-50/80 border-t-2 border-slate-300">
                  <td className="px-2 py-0 border-r border-slate-200 sticky left-0 bg-slate-100 shadow-[1px_0_0_0_rgba(226,232,240,1)] z-10 text-left h-12 sm:h-16">
                    <div className="font-semibold text-slate-700 text-[9px] sm:text-[11px] uppercase tracking-wider">{t('leave_events')}</div>
                  </td>
                  {daysArray.map(day => {
                    const dateKey = getDateKey(currentYear, currentMonth, day);
                    const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                    const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';

                    let events = [];
                    members.forEach(m => {
                      if (m.birthday && m.birthday.substring(5) === dateKey.substring(5)) events.push({ member: m, type: 'birthday' });
                      if (timeOff[dateKey]?.[m.id]) events.push({ member: m, type: timeOff[dateKey][m.id] });
                    });

                    return (
                      <td key={`events-${dateKey}`} className={`p-0.5 border-r border-slate-200 align-top h-12 sm:h-16 overflow-hidden ${isFriSat ? 'bg-blue-50/40' : ''}`}>
                        <div className="flex flex-col gap-0.5 h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {events.map((ev, i) => (
                            <div key={i} className={`text-[8px] sm:text-[9px] px-0.5 py-0.5 rounded border flex items-center justify-center lg:justify-start gap-0.5 ${ev.member.color} bg-white shadow-sm leading-none`} title={`${ev.member.name} - ${ev.type}`}>
                              {ev.type === 'birthday' && <Gift className="w-2.5 h-2.5 text-indigo-500 shrink-0 hidden lg:block" />}
                              {ev.type === 'holiday' && <Sun className="w-2.5 h-2.5 text-orange-500 shrink-0 hidden lg:block" />}
                              {ev.type === 'sick' && <Thermometer className="w-2.5 h-2.5 text-red-500 shrink-0 hidden lg:block" />}
                              {ev.type === 'wish' && <Heart className="w-2.5 h-2.5 text-pink-500 shrink-0 hidden lg:block" />}
                              <span className="truncate font-medium">{ev.member.name.split(' ')[0].substring(0, 3)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Coverage Alerts Row */}
                <tr className="bg-red-50/80 border-t-2 border-red-200">
                  <td className="px-2 py-0 border-r border-red-200 sticky left-0 bg-red-50 shadow-[1px_0_0_0_rgba(254,202,202,1)] z-10 text-left h-12 sm:h-16">
                    <div className="font-bold text-red-700 text-[9px] sm:text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" /> <span className="hidden sm:inline">{t('coverage_alerts')}</span>
                    </div>
                  </td>
                  {daysArray.map(day => {
                    const dateKey = getDateKey(currentYear, currentMonth, day);
                    const dayOfWeekEn = getDayOfWeekShort(currentYear, currentMonth, day, 'en');
                    const isFriSat = dayOfWeekEn === 'Fri' || dayOfWeekEn === 'Sat';
                    const alerts = coverageAlerts[dateKey] || [];

                    return (
                      <td key={`alert-${dateKey}`} className={`p-0.5 border-r border-red-200 align-top h-12 sm:h-16 overflow-hidden ${isFriSat ? 'bg-red-100/40' : ''}`}>
                        <div className="flex flex-col gap-0.5 h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {alerts.map((al, i) => (
                            <div key={i} className="text-[8px] sm:text-[9px] px-0.5 py-0.5 rounded border border-red-300 flex items-center justify-center gap-1 bg-white text-red-700 shadow-sm font-bold leading-none" title={`${al.name} ${t('understaffed')} (${al.assigned}/${al.target} ${t('target')})`}>
                              <span className="truncate">{al.name}: {al.assigned}/{al.target}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly Summary Footer */}
          <div className="border-t border-slate-200 bg-slate-100 p-4 shrink-0 overflow-x-auto shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)] print:break-inside-avoid print:bg-white print:border-none print:shadow-none print:mt-6 print:p-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t('monthly_summary')} ({currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' })})
            </h3>
            <div className="flex gap-3 pb-1 w-max print:flex-wrap">
              {members.map(member => {
                const stats = getMonthlyStats(member.id);
                return (
                  <div key={member.id} className="w-[180px] bg-white border border-slate-200 shadow-sm rounded-lg p-3 flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${member.color}`}>
                        {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-sm text-slate-900 truncate">{member.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase">{t('shifts_worked')}</span>
                        <span className="font-semibold text-slate-700">{stats.shiftsWorked}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] text-slate-400 uppercase">{t('hours_worked')}</span>
                        <span className="font-semibold text-slate-700">{stats.hoursWorked}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-slate-400 uppercase">{t('rest_days')}</span>
                        <span className="font-semibold text-green-600">{stats.restDays}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-xs text-slate-600 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] text-orange-400 uppercase">{t('holidays_taken')}</span>
                        <span className="font-semibold text-orange-600">{stats.holidays}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] text-red-400 uppercase">{t('sick_days_taken')}</span>
                        <span className="font-semibold text-red-600">{stats.sickDays}</span>
                      </div>
                      <div className="flex flex-col text-center">
                        <span className="text-[10px] text-pink-400 uppercase">{t('wish_days_taken')}</span>
                        <span className="font-semibold text-pink-600">{stats.wishDays}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
