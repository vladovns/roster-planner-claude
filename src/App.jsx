import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, Calendar, Clock, Plus, Trash2, X, UserPlus,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Wand2, Sun,
  Heart, Gift, Printer, Loader2, Thermometer, Pencil, ShieldCheck,
  Globe, Download, Upload, AlertTriangle
} from 'lucide-react';

// --- TRANSLATIONS DICTIONARY ---
const translations = {
  en: {
    app_title: "Team Roster Planner",
    monthly_roster: "Monthly Roster", manage_team: "Manage Team", manage_shifts: "Manage Shifts", roles_rules: "Roles & Rules", leaves_holidays: "Leaves & Holidays",
    team_members: "Team Members", add_remove_personnel: "Add or remove personnel from your roster pool.", full_name: "Full Name", role: "Role", birthday: "Birthday", add: "Add", no_team_members: "No team members added yet.",
    shift_types: "Shift Types", define_working_periods: "Define the working periods and targets.", shift_name: "Shift Name", time_example: "Time (e.g. 08:00 - 16:00)", shift_color: "Shift Color", no_shifts: "No shifts defined yet.",
    create_roles: "Create Role", roles_and_rules: "Roles & Assignment Rules", define_roles: "Create team roles and assign smart shift priorities or exclusions.", role_name: "Role Name", priority_target: "Priority Target", flexible: "Flexible (No Preference)", mainly: "Mainly (Prioritize a shift)", only: "Only (Exclusive to one shift)", preferred_shift: "Preferred Shift", hard_exclusions: "Hard Exclusions (Never assign to these shifts):", fixed_days_off: "Fixed Days Off (Always off on these days):", no_roles: "No roles defined.", assignment_rule: "Assignment Rule", exclusions: "Exclusions", add_roles_first: "Add Roles First", priority: "Priority", shift_priority_hint: "Lower number = filled first (1 = highest priority)",
    book_holidays: "Book holidays, sick days, and wish days for staff.", start_date: "Start Date", end_date: "End Date", book: "Book", no_time_off: "No time off booked yet.", holiday: "Holiday", sick_day: "Sick Day", wish_day: "Wish Day", conflict: "Conflict",
    monthly_schedule: "Monthly Schedule", export_pdf: "Export PDF", exporting: "Exporting...", auto_schedule: "Auto-Schedule", clear_month: "Clear Month", shift_legend: "Shift Legend:", datum: "Date", leave_events: "Leave & Events", monthly_summary: "Monthly Summary", shifts_worked: "Shifts", days_off: "Days Off", hours_worked: "Hours",
    assign_shift_for: "Assign shift for", off: "OFF", rest_day: "Rest Day", sick: "SICK", sick_leave: "Sick Leave", cancel: "Cancel", save_changes: "Save Changes", edit_team_member: "Edit Team Member", edit_shift: "Edit Shift", edit_role: "Edit Role",
    day_1: "Mon", day_2: "Tue", day_3: "Wed", day_4: "Thu", day_5: "Fri", day_6: "Sat", day_0: "Sun", save_backup: "Save Data", load_backup: "Load Data",
    staffing_targets: "Staffing Targets (Employees per day)", coverage_alerts: "Coverage Alerts", understaffed: "Understaffed", target: "Target",
    min_hours: "Min Hours", max_days_off: "Max Days Off", create_new_shift: "Create New Shift", edit_shift_targets: "Staffing Targets (For this shift)", min_two_days_off: "Min 2 Days Off",
    confirm_overwrite: "This person already has a booking on some of these dates. Overwrite?", remove_block: "Remove entire booking block?"
  },
  de: {
    app_title: "Dienstplaner",
    monthly_roster: "Monatsplan", manage_team: "Team verwalten", manage_shifts: "Schichten verwalten", roles_rules: "Rollen & Regeln", leaves_holidays: "Urlaub & Abwesenheit",
    team_members: "Teammitglieder", add_remove_personnel: "Personal zum Dienstplan hinzufügen oder entfernen.", full_name: "Vollständiger Name", role: "Rolle", birthday: "Geburtstag", add: "Hinzufügen", no_team_members: "Noch keine Teammitglieder hinzugefügt.",
    shift_types: "Schichtarten", define_working_periods: "Arbeitszeiten und Ziele definieren.", shift_name: "Schichtname", time_example: "Zeit (z.B. 08:00 - 16:00)", shift_color: "Schichtfarbe", no_shifts: "Noch keine Schichten definiert.",
    create_roles: "Rolle erstellen", roles_and_rules: "Rollen & Zuweisungsregeln", define_roles: "Teamrollen erstellen und Schichtprioritäten oder Ausschlüsse festlegen.", role_name: "Rollenname", priority_target: "Prioritätsziel", flexible: "Flexibel (Keine Präferenz)", mainly: "Hauptsächlich (Schicht priorisieren)", only: "Nur (Exklusiv für eine Schicht)", preferred_shift: "Bevorzugte Schicht", hard_exclusions: "Strikte Ausschlüsse (Nie für diese Schichten einteilen):", fixed_days_off: "Feste freie Tage (An diesen Tagen immer frei):", no_roles: "Keine Rollen definiert.", assignment_rule: "Zuweisungsregel", exclusions: "Ausschlüsse", add_roles_first: "Zuerst Rollen hinzufügen", priority: "Priorität", shift_priority_hint: "Niedrigere Zahl = zuerst besetzt (1 = höchste Priorität)",
    book_holidays: "Urlaub, Krankheitstage und Wunschtage buchen.", start_date: "Startdatum", end_date: "Enddatum", book: "Buchen", no_time_off: "Noch keine Abwesenheiten gebucht.", holiday: "Urlaub", sick_day: "Krankheitstag", wish_day: "Wunschtag", conflict: "Konflikt",
    monthly_schedule: "Monatsplan", export_pdf: "PDF Exportieren", exporting: "Exportiere...", auto_schedule: "Auto-Planung", clear_month: "Monat leeren", shift_legend: "Schichtlegende:", datum: "Datum", leave_events: "Abwesenheiten & Events", monthly_summary: "Monatszusammenfassung", shifts_worked: "Schichten", days_off: "Freie Tage", hours_worked: "Stunden",
    assign_shift_for: "Schicht zuweisen für", off: "FREI", rest_day: "Ruhetag", sick: "KRANK", sick_leave: "Krankenstand", cancel: "Abbrechen", save_changes: "Speichern", edit_team_member: "Mitglied bearbeiten", edit_shift: "Schicht bearbeiten", edit_role: "Rolle bearbeiten",
    day_1: "Mo", day_2: "Di", day_3: "Mi", day_4: "Do", day_5: "Fr", day_6: "Sa", day_0: "So", save_backup: "Daten speichern", load_backup: "Daten laden",
    staffing_targets: "Personalbedarf (Pro Tag)", coverage_alerts: "Abdeckungswarnungen", understaffed: "Unterbesetzt", target: "Ziel",
    min_hours: "Min. Stunden", max_days_off: "Max. freie Tage", create_new_shift: "Neue Schicht erstellen", edit_shift_targets: "Personalbedarf (Für diese Schicht)", min_two_days_off: "Min. 2 Tage Frei",
    confirm_overwrite: "Diese Person hat bereits eine Buchung an einigen Tagen. Überschreiben?", remove_block: "Gesamten Buchungsblock entfernen?"
  },
};

const langMap = { en: 'en-US', de: 'de-DE' };

// =============================================
// PURE HELPER FUNCTIONS (no state dependency)
// =============================================
function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getDayOfWeekShort(year, month, day, lang = 'en') { return new Date(year, month, day).toLocaleDateString(langMap[lang] || 'en-US', { weekday: 'short' }); }
function pad(n) { return n.toString().padStart(2, '0'); }
function getDateKey(year, month, day) { return `${year}-${pad(month + 1)}-${pad(day)}`; }
function getRandomHex() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); }

function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && dateInput.includes('-')) {
    const parts = dateInput.split('-');
    if (parts.length >= 3) return `${pad(parts[2].substring(0,2))}.${pad(parts[1])}.${parts[0]}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/**
 * FIX: Now actually used in monthly stats to show hours worked.
 * Calculates net shift hours accounting for Swiss ArG break rules.
 */
function calculateShiftDuration(timeStr) {
  if (!timeStr) return 0;
  try {
    const parts = timeStr.split(' - ');
    if (parts.length < 2) return 0;
    const [start, end] = parts;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let endTotal = endH + endM / 60;
    const startTotal = startH + startM / 60;
    if (endTotal <= startTotal) endTotal += 24;
    const rawDuration = endTotal - startTotal;
    
    let breakTime = 0;
    if (rawDuration > 9) breakTime = 1; 
    else if (rawDuration > 7) breakTime = 0.75; 
    else if (rawDuration > 5.5) breakTime = 0.25; 

    return Math.max(0, rawDuration - breakTime);
  } catch (e) {
    return 0; 
  }
}

function check11HourRest(timeYesterday, timeToday) {
  if (!timeYesterday || !timeToday) return true;
  try {
    const [yStartStr, yEndStr] = timeYesterday.split(' - ');
    const [tStartStr] = timeToday.split(' - ');

    let yEndH = parseInt(yEndStr.split(':')[0]) + parseInt(yEndStr.split(':')[1]) / 60;
    let yStartH = parseInt(yStartStr.split(':')[0]) + parseInt(yStartStr.split(':')[1]) / 60;
    if (yEndH <= yStartH) yEndH += 24; 

    let tStartH = parseInt(tStartStr.split(':')[0]) + parseInt(tStartStr.split(':')[1]) / 60;
    let restTime = (tStartH + 24) - yEndH;
    return restTime >= 11;
  } catch (e) {
    return true; 
  }
}

// =============================================
// MAIN APP COMPONENT
// =============================================
export default function App() {
  const [language, setLanguage] = useState('en');
  const t = useCallback((key) => translations[language]?.[key] || translations['en'][key] || key, [language]);

  const getDayOfWeekShortLocale = useCallback((year, month, day) => getDayOfWeekShort(year, month, day, language), [language]);

  const [activeTab, setActiveTab] = useState('roster'); 
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [minTwoDaysOff, setMinTwoDaysOff] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const daysArray = useMemo(() => Array.from({ length: daysCount }, (_, i) => i + 1), [daysCount]);

  const [assignments, setAssignments] = useState({});
  const [timeOff, setTimeOff] = useState({}); 
  const [timeOffError, setTimeOffError] = useState(''); 

  const [editingCell, setEditingCell] = useState(null); 
  const [isExporting, setIsExporting] = useState(false); 
  const [newShiftColor, setNewShiftColor] = useState(getRandomHex()); 
  const [newRolePref, setNewRolePref] = useState('flexible'); 

  const [editingMember, setEditingMember] = useState(null); 
  const [editingShift, setEditingShift] = useState(null); 
  const [editingRole, setEditingRole] = useState(null); 

  // --- LOCAL STORAGE PERSISTENCE ---
  useEffect(() => {
    try {
      const localData = localStorage.getItem('teamRosterData');
      if (localData) {
        const data = JSON.parse(localData);
        if (data.roles) setRoles(data.roles);
        if (data.members) setMembers(data.members);
        if (data.shifts) setShifts(data.shifts);
        if (data.assignments) setAssignments(data.assignments);
        if (data.timeOff) setTimeOff(data.timeOff);
        if (data.minTwoDaysOff !== undefined) setMinTwoDaysOff(data.minTwoDaysOff);
      }
    } catch (e) {
      console.error("Local Load Error", e);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('teamRosterData', JSON.stringify({ roles, members, shifts, assignments, timeOff, minTwoDaysOff }));
    }, 1000); 
    return () => clearTimeout(timeoutId);
  }, [roles, members, shifts, assignments, timeOff, minTwoDaysOff]);

  // --- MANUAL BACKUP ---
  const downloadBackup = () => {
    const data = { roles, members, shifts, assignments, timeOff, minTwoDaysOff };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TeamRoster_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.roles) setRoles(data.roles);
        if (data.members) setMembers(data.members);
        if (data.shifts) setShifts(data.shifts);
        if (data.assignments) setAssignments(data.assignments);
        if (data.timeOff) setTimeOff(data.timeOff);
        if (data.minTwoDaysOff !== undefined) setMinTwoDaysOff(data.minTwoDaysOff);
      } catch (err) {
        console.error("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  // --- Handlers for Roles ---
  const addRole = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const preferenceType = formData.get('preferenceType');
    const preferredShiftId = formData.get('preferredShiftId') || null;
    const excludedShiftIds = formData.getAll('excludedShifts'); 
    // FIX: Always store fixedDaysOff as strings for consistent comparison
    const fixedDaysOff = formData.getAll('fixedDaysOff').map(String);

    if (!name) return;

    setRoles([...roles, { id: Date.now().toString(), name, preferenceType, preferredShiftId, excludedShiftIds, fixedDaysOff }]);
    setNewRolePref('flexible');
    e.target.reset();
  };

  const removeRole = (id) => {
    const roleToRemove = roles.find(r => r.id === id);
    setRoles(roles.filter(r => r.id !== id));
    if (roleToRemove) {
      const fallbackRole = roles.find(r => r.id !== id)?.name || '';
      setMembers(members.map(m => m.role === roleToRemove.name ? { ...m, role: fallbackRole } : m));
    }
  };

  const updateRole = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const preferenceType = formData.get('preferenceType');
    const preferredShiftId = formData.get('preferredShiftId') || null;
    const excludedShiftIds = formData.getAll('excludedShifts');
    // FIX: Always store as strings
    const fixedDaysOff = formData.getAll('fixedDaysOff').map(String);

    setRoles(roles.map(r => r.id === editingRole.id ? { ...r, name, preferenceType, preferredShiftId, excludedShiftIds, fixedDaysOff } : r));

    if (name !== editingRole.name) {
      setMembers(members.map(m => m.role === editingRole.name ? { ...m, role: name } : m));
    }
    setEditingRole(null);
  };

  // --- Handlers for Team ---
  const addMember = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const role = formData.get('role');
    const birthday = formData.get('birthday');
    const maxDaysOff = formData.get('maxDaysOff');
    
    if (!name) return;

    const colors = [
      'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 
      'bg-purple-100 text-purple-800', 'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800', 'bg-teal-100 text-teal-800',
      'bg-indigo-100 text-indigo-800', 'bg-rose-100 text-rose-800'
    ];
    const color = colors[members.length % colors.length];

    setMembers([...members, { id: Date.now().toString(), name, role, color, birthday, maxDaysOff }]);
    e.target.reset();
  };

  const removeMember = (id) => {
    setMembers(members.filter(m => m.id !== id));
    const newAssignments = { ...assignments };
    Object.keys(newAssignments).forEach(day => {
      Object.keys(newAssignments[day]).forEach(shiftId => {
        newAssignments[day][shiftId] = newAssignments[day][shiftId].filter(mId => mId !== id);
      });
    });
    setAssignments(newAssignments);
  };

  const moveMemberUp = (index) => {
    if (index === 0) return;
    const newMembers = [...members];
    [newMembers[index - 1], newMembers[index]] = [newMembers[index], newMembers[index - 1]];
    setMembers(newMembers);
  };

  const moveMemberDown = (index) => {
    if (index === members.length - 1) return;
    const newMembers = [...members];
    [newMembers[index + 1], newMembers[index]] = [newMembers[index], newMembers[index + 1]];
    setMembers(newMembers);
  };

  const updateMember = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const role = formData.get('role');
    const birthday = formData.get('birthday');
    const maxDaysOff = formData.get('maxDaysOff');

    setMembers(members.map(m => m.id === editingMember.id ? { ...m, name, role, birthday, maxDaysOff } : m));
    setEditingMember(null);
  };

  // --- Handlers for Shifts ---
  /**
   * IMPROVEMENT: Shifts now have a configurable `priority` field (1 = highest).
   * This replaces the old hardcoded string-matching sort in auto-scheduler.
   */
  const addShift = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const time = formData.get('time');
    const color = formData.get('color') || getRandomHex();
    const priority = parseInt(formData.get('priority'), 10) || 10;
    
    if (!name) return;

    const requirements = {};
    [1, 2, 3, 4, 5, 6, 0].forEach(d => {
      const val = formData.get(`req_${d}`);
      const parsed = parseInt(val, 10);
      requirements[d] = isNaN(parsed) ? 0 : parsed;
    });

    setShifts([...shifts, { id: Date.now().toString(), name, time, color, requirements, priority }]);
    setNewShiftColor(getRandomHex()); 
    e.target.reset();
  };

  const removeShift = (id) => {
    setShifts(shifts.filter(s => s.id !== id));
    const newAssignments = { ...assignments };
    Object.keys(newAssignments).forEach(dateKey => {
      if (newAssignments[dateKey][id]) delete newAssignments[dateKey][id];
    });
    setAssignments(newAssignments);
    setRoles(roles.map(r => ({
      ...r,
      preferredShiftId: r.preferredShiftId === id ? null : r.preferredShiftId,
      preferenceType: r.preferredShiftId === id ? 'flexible' : r.preferenceType,
      excludedShiftIds: (r.excludedShiftIds || []).filter(sId => sId !== id)
    })));
  };

  const updateShift = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const time = formData.get('time');
    const color = formData.get('color');
    const priority = parseInt(formData.get('priority'), 10) || 10;

    const requirements = {};
    [1, 2, 3, 4, 5, 6, 0].forEach(d => {
      const val = formData.get(`req_${d}`);
      const parsed = parseInt(val, 10);
      requirements[d] = isNaN(parsed) ? 0 : parsed;
    });

    setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, name, time, color, requirements, priority } : s));
    setEditingShift(null);
  };

  // --- Handlers for Time Off ---
  const addTimeOff = (e) => {
    e.preventDefault();
    setTimeOffError(''); 
    const formData = new FormData(e.target);
    const memberId = formData.get('memberId');
    const type = formData.get('type');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    if (!memberId || !startDate || !endDate) return;

    const newTimeOff = { ...timeOff };
    let currDate = new Date(startDate);
    const end = new Date(endDate);

    // FIX: Check for holiday conflicts AND warn about same-person overwrites
    if (type === 'holiday') {
      let conflictDateObj = new Date(startDate);
      while (conflictDateObj <= end) {
        const dKey = getDateKey(conflictDateObj.getFullYear(), conflictDateObj.getMonth(), conflictDateObj.getDate());
        if (newTimeOff[dKey]) {
          const othersOnHoliday = Object.entries(newTimeOff[dKey]).find(([id, t]) => id !== memberId && t === 'holiday');
          if (othersOnHoliday) {
            const conflictMember = members.find(m => m.id === othersOnHoliday[0]);
            setTimeOffError(`${t('conflict')}: ${conflictMember?.name || 'Another employee'} is already on holiday on ${formatDateDDMMYYYY(dKey)}.`);
            return;
          }
        }
        conflictDateObj.setDate(conflictDateObj.getDate() + 1);
      }
    }

    while (currDate <= end) {
      const dKey = getDateKey(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
      if (!newTimeOff[dKey]) newTimeOff[dKey] = {};
      newTimeOff[dKey][memberId] = type;
      currDate.setDate(currDate.getDate() + 1);
    }

    setTimeOff(newTimeOff);
    e.target.reset();
  };

  const removeTimeOffEntry = (dateKey, memberId) => {
    const newTimeOff = { ...timeOff };
    if (newTimeOff[dateKey] && newTimeOff[dateKey][memberId]) {
      delete newTimeOff[dateKey][memberId];
      if (Object.keys(newTimeOff[dateKey]).length === 0) delete newTimeOff[dateKey];
      setTimeOff(newTimeOff);
    }
  };

  const handleCellUpdate = (dateKey, memberId, newShiftId, newOffType) => {
    setAssignments(prev => {
      const newAss = { ...prev };
      if (!newAss[dateKey]) newAss[dateKey] = {};
      const dayAss = { ...newAss[dateKey] };

      Object.keys(dayAss).forEach(sId => {
        dayAss[sId] = dayAss[sId].filter(id => id !== memberId);
      });

      if (newShiftId) {
        if (!dayAss[newShiftId]) dayAss[newShiftId] = [];
        dayAss[newShiftId] = [...dayAss[newShiftId], memberId];
      }

      newAss[dateKey] = dayAss;
      return newAss;
    });

    setTimeOff(prev => {
      const newTimeOff = { ...prev };
      if (!newTimeOff[dateKey]) newTimeOff[dateKey] = {};
      
      if (newOffType) newTimeOff[dateKey][memberId] = newOffType;
      else delete newTimeOff[dateKey][memberId];
      return newTimeOff;
    });

    setEditingCell(null);
  };

  const clearMonth = () => {
    const newAssignments = { ...assignments };
    daysArray.forEach(day => {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      delete newAssignments[dateKey];
    });
    setAssignments(newAssignments);
  };

  // =============================================
  // FIX: Completely rewritten auto-scheduler
  // - 5-day consecutive rule now works correctly (checks BEFORE assignment)
  // - Uses configurable shift.priority instead of hardcoded name matching
  // - Cleaner streak tracking
  // =============================================
  const autoSchedule = () => {
    const newAssignments = JSON.parse(JSON.stringify(assignments));
    
    // State trackers per member
    let consecutiveDays = {};
    let mandatoryDaysOff = {};
    let currentStretchShift = {};
    let lastStretchShift = {};
    let daysWorkedThisMonth = {};

    // Helper: check if a member is assigned to ANY shift on a given dateKey
    // Checks both the current month being built AND saved assignments (previous months)
    const getShiftOnDate = (dateKey, memberId) => {
      const source = newAssignments[dateKey] || assignments[dateKey];
      if (!source) return null;
      for (const sId of Object.keys(source)) {
        if (source[sId].includes(memberId)) return sId;
      }
      return null;
    };

    // Helper: check if a member had any type of day off on a given date
    const wasDayOff = (dateKey, memberId, memberObj) => {
      if (timeOff[dateKey]?.[memberId]) return true;
      if (memberObj?.birthday && memberObj.birthday.substring(5) === dateKey.substring(5)) return true;
      const mRole = roles.find(r => r.name === memberObj?.role) || { fixedDaysOff: [] };
      const dateObj = new Date(dateKey + 'T12:00:00');
      const dayNum = dateObj.getDay().toString();
      if ((mRole.fixedDaysOff || []).map(String).includes(dayNum)) return true;
      return false;
    };

    // =============================================
    // CROSS-MONTH INITIALIZATION
    // Look back up to 5 days into the previous month to correctly
    // initialize each member's consecutive work streak.
    // This prevents the scheduler from assigning a 6th consecutive
    // day when someone already worked the last days of last month.
    // =============================================
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0); // day 0 = last day of prev month

    members.forEach((m) => {
      let streak = 0;
      let lastShiftId = null;

      for (let lookback = 0; lookback < 5; lookback++) {
        const checkDate = new Date(prevMonthLastDay);
        checkDate.setDate(checkDate.getDate() - lookback);
        const checkKey = getDateKey(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());

        if (wasDayOff(checkKey, m.id, m)) break;

        const shiftOnDay = getShiftOnDate(checkKey, m.id);
        if (shiftOnDay) {
          streak++;
          if (lookback === 0) lastShiftId = shiftOnDay;
        } else {
          break;
        }
      }

      consecutiveDays[m.id] = streak;
      currentStretchShift[m.id] = lastShiftId;
      lastStretchShift[m.id] = null;
      daysWorkedThisMonth[m.id] = 0;

      // If they already hit 5 at end of previous month, force rest at start
      if (streak >= 5) {
        mandatoryDaysOff[m.id] = minTwoDaysOff ? 2 : 1;
        consecutiveDays[m.id] = 0;
      } else {
        mandatoryDaysOff[m.id] = 0;
      }
    });

    for (let d = 1; d <= daysCount; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeekNum = dateObj.getDay().toString();
      const dateKey = getDateKey(currentYear, currentMonth, d);
      if (!newAssignments[dateKey]) newAssignments[dateKey] = {};

      let available = [];
      members.forEach(m => {
        const isBirthday = m.birthday && m.birthday.substring(5) === dateKey.substring(5);
        const isOff = timeOff[dateKey]?.[m.id];
        
        const mRole = roles.find(r => r.name === m.role) || { fixedDaysOff: [] };
        const isFixedDayOff = (mRole.fixedDaysOff || []).map(String).includes(dayOfWeekNum);

        if (isBirthday || isOff || isFixedDayOff) {
          if (consecutiveDays[m.id] > 0) {
            lastStretchShift[m.id] = currentStretchShift[m.id];
            currentStretchShift[m.id] = null;
          }
          consecutiveDays[m.id] = 0;
          if (mandatoryDaysOff[m.id] > 0) mandatoryDaysOff[m.id]--;
          return;
        }

        // FIX: 5-DAY RULE — Check BEFORE adding to available pool.
        // If they've already worked 5 consecutive days, they MUST rest.
        if (consecutiveDays[m.id] >= 5) {
          mandatoryDaysOff[m.id] = minTwoDaysOff ? 2 : 1;
          lastStretchShift[m.id] = currentStretchShift[m.id];
          currentStretchShift[m.id] = null;
          consecutiveDays[m.id] = 0;
        }

        if (mandatoryDaysOff[m.id] > 0) {
          mandatoryDaysOff[m.id]--;
          if (consecutiveDays[m.id] > 0) {
            lastStretchShift[m.id] = currentStretchShift[m.id];
            currentStretchShift[m.id] = null;
          }
          consecutiveDays[m.id] = 0;
          return;
        }

        available.push(m);
      });

      let workedToday = new Set();
      let assignedShiftToday = {};

      // FIX: Sort by configurable priority field instead of hardcoded name matching
      const prioritizedShifts = [...shifts].sort((a, b) => {
        return (a.priority || 10) - (b.priority || 10);
      });

      // 1. FILL SHIFTS TO MEET REQUIREMENTS
      prioritizedShifts.forEach(shift => {
        const target = shift.requirements && shift.requirements[dayOfWeekNum] !== undefined ? shift.requirements[dayOfWeekNum] : 1;
        if (target <= 0) return;

        if (!newAssignments[dateKey][shift.id]) newAssignments[dateKey][shift.id] = [];
        
        const currentlyAssigned = newAssignments[dateKey][shift.id];
        currentlyAssigned.forEach(id => {
          workedToday.add(id);
          assignedShiftToday[id] = shift.id;
        });

        let shiftAvailable = available.filter(m => !workedToday.has(m.id));
        let needed = target - currentlyAssigned.length;

        while (needed > 0) {
          let legalCandidates = shiftAvailable.filter(m => {
            const yesterday = new Date(currentYear, currentMonth, d - 1);
            const yDateKey = getDateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
            const yShiftId = getShiftOnDate(yDateKey, m.id);
            const yShiftTime = yShiftId ? shifts.find(s => s.id === yShiftId)?.time : null;
            
            if (!check11HourRest(yShiftTime, shift.time)) return false;

            const mRole = roles.find(r => r.name === m.role);
            if (mRole) {
              if (mRole.excludedShiftIds && mRole.excludedShiftIds.includes(shift.id)) return false;
              if (mRole.preferenceType === 'only' && mRole.preferredShiftId !== shift.id) return false;
            }
            return true;
          });

          if (legalCandidates.length === 0) break;

          let scoredCandidates = legalCandidates.map(m => {
            let score = 0;
            const mRole = roles.find(r => r.name === m.role) || { preferenceType: 'flexible', excludedShiftIds: [] };
            
            if (mRole.preferenceType === 'only' && mRole.preferredShiftId === shift.id) {
              score -= 1000;
            } else if (mRole.preferenceType === 'mainly') {
              if (mRole.preferredShiftId === shift.id) score -= 500;
              else score += 200;
            }

            const isNewStretch = (consecutiveDays[m.id] || 0) === 0;
            const currShift = currentStretchShift[m.id];
            
            if (!isNewStretch && currShift === shift.id) score -= 80;
            else if (!isNewStretch && currShift !== shift.id) score += 80;

            // FIX: Stronger penalty at 4 consecutive days to avoid forced rest
            if (consecutiveDays[m.id] === 4) score += 500;

            const dPlus1 = new Date(currentYear, currentMonth, d + 1);
            const dMinus1 = new Date(currentYear, currentMonth, d - 1);

            const isOffNearby = timeOff[getDateKey(dPlus1.getFullYear(), dPlus1.getMonth(), dPlus1.getDate())]?.[m.id] || 
                                timeOff[getDateKey(dMinus1.getFullYear(), dMinus1.getMonth(), dMinus1.getDate())]?.[m.id];
            if (isOffNearby) score += 400;

            return { member: m, score, consecutive: (consecutiveDays[m.id] || 0) };
          });

          scoredCandidates.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return a.consecutive - b.consecutive;
          });

          const chosen = scoredCandidates[0].member;
          newAssignments[dateKey][shift.id].push(chosen.id);
          workedToday.add(chosen.id);
          assignedShiftToday[chosen.id] = shift.id;
          shiftAvailable = shiftAvailable.filter(m => m.id !== chosen.id);
          needed--;
        }
      });

      // 2. FORCE ASSIGNMENT FOR MAX DAYS OFF
      available.forEach(m => {
        if (!workedToday.has(m.id) && m.maxDaysOff) {
          const maxOff = parseInt(m.maxDaysOff, 10);
          if (!isNaN(maxOff)) {
            const minWorkDays = daysCount - maxOff;
            const remainingDays = daysCount - d + 1;
            const daysLeftToWork = minWorkDays - (daysWorkedThisMonth[m.id] || 0);

            if (daysLeftToWork >= remainingDays) {
              let eligibleShifts = prioritizedShifts.filter(shift => {
                const yesterday = new Date(currentYear, currentMonth, d - 1);
                const yDateKey = getDateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                const yShiftId = getShiftOnDate(yDateKey, m.id);
                const yShiftTime = yShiftId ? shifts.find(s => s.id === yShiftId)?.time : null;
                
                if (!check11HourRest(yShiftTime, shift.time)) return false;

                const mRole = roles.find(r => r.name === m.role);
                if (mRole) {
                  if (mRole.excludedShiftIds && mRole.excludedShiftIds.includes(shift.id)) return false;
                  if (mRole.preferenceType === 'only' && mRole.preferredShiftId !== shift.id) return false;
                }
                return true;
              });

              if (eligibleShifts.length > 0) {
                eligibleShifts.sort((a, b) => {
                  const mRole = roles.find(r => r.name === m.role);
                  if (mRole && mRole.preferredShiftId === a.id) return -1;
                  if (mRole && mRole.preferredShiftId === b.id) return 1;
                  return (newAssignments[dateKey][a.id]?.length || 0) - (newAssignments[dateKey][b.id]?.length || 0);
                });

                const chosenShift = eligibleShifts[0];
                if (!newAssignments[dateKey][chosenShift.id]) newAssignments[dateKey][chosenShift.id] = [];
                newAssignments[dateKey][chosenShift.id].push(m.id);
                workedToday.add(m.id);
                assignedShiftToday[m.id] = chosenShift.id;
              }
            }
          }
        }
      });

      // 3. TRACK DAYS WORKED & STREAKS
      members.forEach(m => {
        if (workedToday.has(m.id)) {
          daysWorkedThisMonth[m.id] = (daysWorkedThisMonth[m.id] || 0) + 1;
          const shiftWorked = assignedShiftToday[m.id];
          if ((consecutiveDays[m.id] || 0) === 0) currentStretchShift[m.id] = shiftWorked;
          else if (currentStretchShift[m.id] !== shiftWorked) currentStretchShift[m.id] = shiftWorked;

          consecutiveDays[m.id] = (consecutiveDays[m.id] || 0) + 1;
        } else {
          if (!mandatoryDaysOff[m.id]) {
            if (consecutiveDays[m.id] >= 5) {
              mandatoryDaysOff[m.id] = minTwoDaysOff ? 1 : 0;
            } else if (consecutiveDays[m.id] > 0 && minTwoDaysOff) {
              mandatoryDaysOff[m.id] = 1;
            }
            if (consecutiveDays[m.id] > 0) {
              lastStretchShift[m.id] = currentStretchShift[m.id];
              currentStretchShift[m.id] = null;
            }
            consecutiveDays[m.id] = 0;
          }
        }
      });
    }
    setAssignments(newAssignments);
  };

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const getMemberShiftOnDate = useCallback((dateKey, memberId) => {
    if (!assignments[dateKey]) return null;
    for (const shiftId of Object.keys(assignments[dateKey])) {
      if (assignments[dateKey][shiftId].includes(memberId)) {
        return shiftId;
      }
    }
    return null;
  }, [assignments]);

  const getHolidaysUsed = useCallback((memberId) => {
    let count = 0;
    Object.keys(timeOff).forEach(dateKey => {
      if (dateKey.startsWith(currentYear.toString()) && timeOff[dateKey][memberId] === 'holiday') {
        count++;
      }
    });
    return count;
  }, [timeOff, currentYear]);

  /**
   * FIX: Birthday is no longer counted as a worked day.
   * IMPROVEMENT: Now also calculates total hours worked using calculateShiftDuration.
   */
  const getMonthlyStats = useCallback((memberId) => {
    let daysWorked = 0;
    let hoursWorked = 0;

    for (let d = 1; d <= daysCount; d++) {
      const dateKey = getDateKey(currentYear, currentMonth, d);
      
      // Check each shift for this member
      for (const shift of shifts) {
        if (assignments[dateKey]?.[shift.id]?.includes(memberId)) {
          daysWorked++;
          hoursWorked += calculateShiftDuration(shift.time);
          break; // Only count once per day even if somehow double-assigned
        }
      }
    }
    return { shiftsWorked: daysWorked, daysOff: daysCount - daysWorked, hoursWorked: Math.round(hoursWorked * 10) / 10 };
  }, [daysCount, currentYear, currentMonth, shifts, assignments]);

  // OPTIMIZATION: Memoize coverage alerts so they don't recompute on every render
  const coverageAlerts = useMemo(() => {
    const alerts = {};
    daysArray.forEach(day => {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeekNum = dateObj.getDay().toString();
      
      const dayAlerts = [];
      shifts.forEach(s => {
        const target = s.requirements && s.requirements[dayOfWeekNum] !== undefined ? s.requirements[dayOfWeekNum] : 1;
        if (target > 0) {
          const assigned = assignments[dateKey]?.[s.id]?.length || 0;
          if (assigned < target) {
            dayAlerts.push({ name: s.name, assigned, target });
          }
        }
      });
      if (dayAlerts.length > 0) alerts[dateKey] = dayAlerts;
    });
    return alerts;
  }, [daysArray, currentYear, currentMonth, shifts, assignments]);

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
        margin:       0.2,
        filename:     `Team_Roster_${currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' })}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' } 
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <style type="text/css" media="print">
        {`@page { size: landscape; margin: 10mm; }`}
      </style>
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-2 mr-6 shrink-0">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">{t('app_title')}</h1>
          </div>
          <nav className="flex space-x-1 sm:space-x-4 shrink-0 flex-1">
            {['roster', 'team', 'shifts', 'roles', 'timeoff'].map(tab => {
              const icons = { roster: Calendar, team: Users, shifts: Clock, roles: ShieldCheck, timeoff: Sun };
              const labels = { roster: 'monthly_roster', team: 'manage_team', shifts: 'manage_shifts', roles: 'roles_rules', timeoff: 'leaves_holidays' };
              const Icon = icons[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="hidden sm:inline">{t(labels[tab])}</span>
                  <Icon className="w-5 h-5 sm:hidden" title={t(labels[tab])} />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-4">
            <button onClick={downloadBackup} className="text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-1.5 px-3 rounded-md transition flex items-center gap-2 hidden lg:flex" title={t('save_backup')}>
              <Download className="w-4 h-4" /> <span>{t('save_backup')}</span>
            </button>
            <label className="cursor-pointer text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-1.5 px-3 rounded-md transition flex items-center gap-2 hidden lg:flex" title={t('load_backup')}>
              <Upload className="w-4 h-4" /> <span>{t('load_backup')}</span>
              <input type="file" accept=".json" onChange={uploadBackup} className="hidden" />
            </label>
            <Globe className="w-4 h-4 text-slate-400 ml-2" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none print:w-full">
        
        {/* --- TEAM MANAGEMENT TAB --- */}
        {activeTab === 'team' && (
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
                          <ShieldCheck className="w-3 h-3 text-slate-400"/> {member.role}
                        </span>
                        {member.maxDaysOff ? <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-emerald-500"/> {member.maxDaysOff} {t('max_days_off')}</span> : null}
                        {member.birthday ? <span className="flex items-center gap-1"><Gift className="w-3 h-3 text-indigo-400"/> {formatDateDDMMYYYY(member.birthday)}</span> : null}
                        <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-orange-400"/> {getHolidaysUsed(member.id)} / 25 Days</span>
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
        )}

        {/* --- SHIFTS MANAGEMENT TAB --- */}
        {activeTab === 'shifts' && (
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
                  {/* NEW: Priority field */}
                  <div className="flex-none w-20">
                    <input type="number" name="priority" defaultValue="10" min="1" max="99" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-center" title={t('shift_priority_hint')} placeholder={t('priority')} />
                  </div>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <label className="block text-xs font-medium text-slate-700 mb-2">{t('edit_shift_targets')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5, 6, 0].map(d => (
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
                        {[1, 2, 3, 4, 5, 6, 0].map(d => (
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
        )}

        {/* --- ROLES & RULES TAB --- */}
        {activeTab === 'roles' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t('roles_and_rules')}</h2>
                <p className="text-sm text-slate-500">{t('define_roles')}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-indigo-100" />
            </div>
            
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <form onSubmit={addRole} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <div className="flex-[2] min-w-[180px]">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('role_name')}</label>
                    <input type="text" name="name" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-medium text-slate-700 mb-1">{t('priority_target')}</label>
                    <select name="preferenceType" value={newRolePref} onChange={e => setNewRolePref(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                      <option value="flexible">{t('flexible')}</option>
                      <option value="mainly">{t('mainly')}</option>
                      <option value="only">{t('only')}</option>
                    </select>
                  </div>
                  {newRolePref !== 'flexible' ? (
                    <div className="flex-1 min-w-[150px]">
                      <label className="block text-xs font-medium text-slate-700 mb-1">{t('preferred_shift')}</label>
                      <select name="preferredShiftId" required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                        {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  ) : null}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">{t('hard_exclusions')}</label>
                    <div className="flex flex-wrap gap-2">
                      {shifts.length === 0 ? <span className="text-xs text-slate-400">{t('no_shifts')}</span> : null}
                      {shifts.map(s => (
                        <label key={s.id} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                          <input type="checkbox" name="excludedShifts" value={s.id} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">{t('fixed_days_off')}</label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 0].map(dayNum => (
                        <label key={`fd-${dayNum}`} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                          <input type="checkbox" name="fixedDaysOff" value={dayNum} className="rounded text-indigo-600 focus:ring-indigo-500" />
                          {t(`day_${dayNum}`)}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-medium text-sm">
                    <Plus className="w-4 h-4" /> {t('create_roles')}
                  </button>
                </div>
              </form>
            </div>

            <ul className="divide-y divide-slate-200">
              {roles.length === 0 ? (
                <li className="p-6 text-center text-slate-500">{t('no_roles')}</li>
              ) : roles.map(role => {
                const prefShift = role.preferredShiftId ? shifts.find(s => s.id === role.preferredShiftId) : null;
                const excludedNames = role.excludedShiftIds?.map(id => shifts.find(s => s.id === id)?.name).filter(Boolean).join(', ') || '-';
                const fixedDaysNames = role.fixedDaysOff?.map(dNum => t(`day_${dNum}`)).join(', ') || '-';
                
                return (
                  <li key={role.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-500"/> {role.name}
                      </p>
                      <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                        <p>
                          <span className="font-medium text-slate-700">{t('assignment_rule')}: </span> 
                          {role.preferenceType === 'flexible' ? t('flexible') : 
                           role.preferenceType === 'mainly' ? `${t('mainly')} (${prefShift?.name || '?'})` : 
                           `${t('only')} (${prefShift?.name || '?'})`}
                        </p>
                        {role.excludedShiftIds?.length > 0 ? (
                          <p className="text-red-600"><span className="font-medium">{t('exclusions')}:</span> {excludedNames}</p>
                        ) : null}
                        {role.fixedDaysOff?.length > 0 ? (
                          <p className="text-green-600"><span className="font-medium">{t('fixed_days_off')}</span> {fixedDaysNames}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 self-end sm:self-center">
                      <button onClick={() => setEditingRole(role)} className="text-slate-400 hover:text-blue-500 p-2 rounded-full hover:bg-blue-50 transition"><Pencil className="w-5 h-5" /></button>
                      <button onClick={() => removeRole(role.id)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* --- TIME OFF TAB --- */}
        {activeTab === 'timeoff' && (
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                            {type === 'holiday' ? <Sun className="w-3 h-3 text-orange-500"/> : type === 'sick' ? <Thermometer className="w-3 h-3 text-red-500"/> : <Heart className="w-3 h-3 text-pink-500"/>}
                            {member.name} ({type === 'holiday' ? t('holiday') : type === 'sick' ? t('sick_day') : t('wish_day')})
                          </p>
                        </div>
                      </div>
                      <button onClick={() => removeTimeOffEntry(dateKey, memberId)} className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><Trash2 className="w-5 h-5" /></button>
                    </li>
                  )
                });
              })}
            </ul>
          </div>
        )}

        {/* --- ROSTER GRID TAB --- */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] print:block print:h-auto print:overflow-visible print:border-none print:shadow-none">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 print:bg-white print:border-none print:p-0 print:mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-sm print:border-none print:shadow-none">
                  <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-l-lg border-r border-slate-300 print:hidden"><ChevronLeft className="w-5 h-5" /></button>
                  <div className="px-4 py-2 font-semibold text-slate-800 min-w-[150px] text-center print:text-2xl print:px-0 print:text-left capitalize">
                    {currentDate.toLocaleString(langMap[language] || 'en-US', { month: 'long', year: 'numeric' })}
                  </div>
                  <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-r-lg border-l border-slate-300 print:hidden"><ChevronRight className="w-5 h-5" /></button>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 hidden xl:block print:hidden">{t('monthly_schedule')}</h2>
                </div>
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
                          )
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
                          )
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
                                    setEditingCell({ dateKey, dateLabel: `${day} ${getDayOfWeekShortLocale(currentYear, currentMonth, day)}`, memberId: member.id, currentShiftId: assignedShiftId, currentOffType: memberOffType })
                                 }}
                                 className={`p-0 border-r border-slate-200 text-center text-[9px] sm:text-[11px] transition-colors ${!isBirthday && !isFixedOff ? 'cursor-pointer hover:bg-slate-200/50' : ''} ${baseBg} ${cellClass}`}
                                 style={cellStyle}
                               >
                                  <div className="flex items-center justify-center w-full h-9 sm:h-12">
                                    {display}
                                  </div>
                               </td>
                             )
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
                            if (m.birthday && m.birthday.substring(5) === dateKey.substring(5)) {
                              events.push({ member: m, type: 'birthday' });
                            }
                            if (timeOff[dateKey] && timeOff[dateKey][m.id]) {
                              events.push({ member: m, type: timeOff[dateKey][m.id] });
                            }
                          });

                          return (
                            <td key={`events-${dateKey}`} className={`p-0.5 border-r border-slate-200 align-top h-12 sm:h-16 overflow-hidden ${isFriSat ? 'bg-blue-50/40' : ''}`}>
                               <div className="flex flex-col gap-0.5 h-full overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                 {events.map((ev, i) => (
                                   <div key={i} className={`text-[8px] sm:text-[9px] px-0.5 py-0.5 rounded border flex items-center justify-center lg:justify-start gap-0.5 ${ev.member.color} bg-white shadow-sm leading-none`} title={`${ev.member.name} - ${ev.type}`}>
                                     {ev.type === 'birthday' && <Gift className="w-2.5 h-2.5 text-indigo-500 shrink-0 hidden lg:block"/>}
                                     {ev.type === 'holiday' && <Sun className="w-2.5 h-2.5 text-orange-500 shrink-0 hidden lg:block"/>}
                                     {ev.type === 'sick' && <Thermometer className="w-2.5 h-2.5 text-red-500 shrink-0 hidden lg:block"/>}
                                     {ev.type === 'wish' && <Heart className="w-2.5 h-2.5 text-pink-500 shrink-0 hidden lg:block"/>}
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
                
                {/* Monthly Summary Footer - NOW SHOWS HOURS */}
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
                          <div className="flex justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100">
                             <div className="flex flex-col">
                               <span className="text-[10px] text-slate-400 uppercase">{t('shifts_worked')}</span>
                               <span className="font-semibold text-slate-700">{stats.shiftsWorked}</span>
                             </div>
                             <div className="flex flex-col text-center">
                               <span className="text-[10px] text-slate-400 uppercase">{t('hours_worked')}</span>
                               <span className="font-semibold text-slate-700">{stats.hoursWorked}</span>
                             </div>
                             <div className="flex flex-col text-right">
                               <span className="text-[10px] text-slate-400 uppercase">{t('days_off')}</span>
                               <span className="font-semibold text-slate-700">{stats.daysOff}</span>
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
        )}

      </main>

      {/* --- ASSIGNMENT MODAL --- */}
      {editingCell ? (() => {
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
                    {t('off')} <br/> <span className="text-[10px] font-normal opacity-70">{t('rest_day')}</span>
                  </button>
                  <button 
                    onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'holiday')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'holiday' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-orange-600 hover:bg-orange-50'}`}
                  >
                    HOL <br/> <span className="text-[10px] font-normal opacity-70 text-slate-500">{t('holiday')}</span>
                  </button>
                  <button 
                    onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'sick')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'sick' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-200 text-red-600 hover:bg-red-50'}`}
                  >
                    {t('sick')} <br/> <span className="text-[10px] font-normal opacity-70 text-slate-500">{t('sick_leave')}</span>
                  </button>
                  <button 
                    onClick={() => handleCellUpdate(editingCell.dateKey, editingCell.memberId, null, 'wish')}
                    className={`p-3 rounded-lg border text-sm font-bold transition-colors ${editingCell.currentOffType === 'wish' ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-slate-200 text-pink-600 hover:bg-pink-50'}`}
                  >
                    WSH <br/> <span className="text-[10px] font-normal opacity-70 text-slate-500">{t('wish_day')}</span>
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
                      {s.name} <br/> <span className="text-[10px] font-normal opacity-70">{s.time}</span>
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
      })() : null}

      {/* --- EDIT MEMBER MODAL --- */}
      {editingMember && (
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('birthday')}</label>
                <input type="date" name="birthday" defaultValue={editingMember.birthday} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-500" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium text-sm">{t('cancel')}</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">{t('save_changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT SHIFT MODAL --- */}
      {editingShift && (
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
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('shift_color')}</label>
                  <input type="color" name="color" defaultValue={editingShift.color} className="h-10 w-14 p-1 rounded-lg border border-slate-300 shadow-sm bg-white cursor-pointer" />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('priority')}</label>
                  <input type="number" name="priority" defaultValue={editingShift.priority || 10} min="1" max="99" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border text-center" />
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('edit_shift_targets')}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map(d => (
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
      )}

      {/* --- EDIT ROLE MODAL --- */}
      {editingRole && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">{t('edit_role')}</h3>
              <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={updateRole} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('role_name')}</label>
                <input type="text" name="name" defaultValue={editingRole.name} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('priority_target')}</label>
                <select name="preferenceType" value={editingRole.preferenceType} onChange={e => setEditingRole({...editingRole, preferenceType: e.target.value})} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                  <option value="flexible">{t('flexible')}</option>
                  <option value="mainly">{t('mainly')}</option>
                  <option value="only">{t('only')}</option>
                </select>
              </div>
              {editingRole.preferenceType !== 'flexible' ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('preferred_shift')}</label>
                  <select name="preferredShiftId" defaultValue={editingRole.preferredShiftId} required className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              ) : null}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('hard_exclusions')}</label>
                  <div className="flex flex-wrap gap-2">
                    {shifts.length === 0 ? <span className="text-xs text-slate-400">{t('no_shifts')}</span> : null}
                    {shifts.map(s => (
                      <label key={s.id} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                        <input type="checkbox" name="excludedShifts" value={s.id} defaultChecked={editingRole.excludedShiftIds?.includes(s.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{t('fixed_days_off')}</label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5, 6, 0].map(dayNum => (
                      <label key={`fd-${dayNum}`} className="flex items-center gap-1 text-sm text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded cursor-pointer hover:bg-slate-50 transition">
                        <input type="checkbox" name="fixedDaysOff" value={dayNum} defaultChecked={(editingRole.fixedDaysOff || []).map(String).includes(String(dayNum))} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {t(`day_${dayNum}`)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingRole(null)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition font-medium text-sm">{t('cancel')}</button>
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm">{t('save_changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
