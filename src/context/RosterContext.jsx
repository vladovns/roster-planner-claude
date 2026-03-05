import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations, langMap } from '../utils/translations';
import {
  getDaysInMonth, getDayOfWeekShort, getDateKey, getRandomHex, generateId,
  formatDateDDMMYYYY, calculateShiftDuration, check11HourRest,
  MEMBER_COLORS, DEFAULT_HOLIDAY_ALLOWANCE, DAY_NUMBERS,
} from '../utils/helpers';

const RosterContext = createContext(null);

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) throw new Error('useRoster must be used within RosterProvider');
  return ctx;
}

export function RosterProvider({ children }) {
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
  const downloadBackup = useCallback(() => {
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
  }, [roles, members, shifts, assignments, timeOff, minTwoDaysOff]);

  const uploadBackup = useCallback((e) => {
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
  }, []);

  // --- ROLE HANDLERS ---
  const addRole = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    if (!name) return;
    const preferenceType = formData.get('preferenceType');
    const preferredShiftId = formData.get('preferredShiftId') || null;
    const excludedShiftIds = formData.getAll('excludedShifts');
    const fixedDaysOff = formData.getAll('fixedDaysOff').map(String);

    setRoles(prev => [...prev, { id: generateId(), name, preferenceType, preferredShiftId, excludedShiftIds, fixedDaysOff }]);
    setNewRolePref('flexible');
    e.target.reset();
  }, []);

  const removeRole = useCallback((id) => {
    setRoles(prev => {
      const roleToRemove = prev.find(r => r.id === id);
      if (roleToRemove) {
        const fallbackRole = prev.find(r => r.id !== id)?.name || '';
        setMembers(mPrev => mPrev.map(m => m.role === roleToRemove.name ? { ...m, role: fallbackRole } : m));
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const updateRole = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const preferenceType = formData.get('preferenceType');
    const preferredShiftId = formData.get('preferredShiftId') || null;
    const excludedShiftIds = formData.getAll('excludedShifts');
    const fixedDaysOff = formData.getAll('fixedDaysOff').map(String);

    setEditingRole(prev => {
      if (!prev) return null;
      setRoles(rPrev => rPrev.map(r => r.id === prev.id ? { ...r, name, preferenceType, preferredShiftId, excludedShiftIds, fixedDaysOff } : r));
      if (name !== prev.name) {
        setMembers(mPrev => mPrev.map(m => m.role === prev.name ? { ...m, role: name } : m));
      }
      return null;
    });
  }, []);

  // --- TEAM HANDLERS ---
  const addMember = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    if (!name) return;
    const role = formData.get('role');
    const birthday = formData.get('birthday');
    const maxDaysOff = formData.get('maxDaysOff');
    const holidayAllowance = formData.get('holidayAllowance') || DEFAULT_HOLIDAY_ALLOWANCE;

    setMembers(prev => {
      const color = MEMBER_COLORS[prev.length % MEMBER_COLORS.length];
      return [...prev, { id: generateId(), name, role, color, birthday, maxDaysOff, holidayAllowance: parseInt(holidayAllowance, 10) || DEFAULT_HOLIDAY_ALLOWANCE }];
    });
    e.target.reset();
  }, []);

  const removeMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setAssignments(prev => {
      const newAss = structuredClone(prev);
      Object.keys(newAss).forEach(day => {
        Object.keys(newAss[day]).forEach(shiftId => {
          newAss[day][shiftId] = newAss[day][shiftId].filter(mId => mId !== id);
        });
      });
      return newAss;
    });
  }, []);

  const moveMemberUp = useCallback((index) => {
    if (index === 0) return;
    setMembers(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveMemberDown = useCallback((index) => {
    setMembers(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }, []);

  const updateMember = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const role = formData.get('role');
    const birthday = formData.get('birthday');
    const maxDaysOff = formData.get('maxDaysOff');
    const holidayAllowance = formData.get('holidayAllowance') || DEFAULT_HOLIDAY_ALLOWANCE;

    setEditingMember(prev => {
      if (!prev) return null;
      setMembers(mPrev => mPrev.map(m => m.id === prev.id
        ? { ...m, name, role, birthday, maxDaysOff, holidayAllowance: parseInt(holidayAllowance, 10) || DEFAULT_HOLIDAY_ALLOWANCE }
        : m
      ));
      return null;
    });
  }, []);

  // --- SHIFT HANDLERS ---
  const addShift = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    if (!name) return;
    const time = formData.get('time');
    const color = formData.get('color') || getRandomHex();
    const priority = parseInt(formData.get('priority'), 10) || 10;

    const requirements = {};
    DAY_NUMBERS.forEach(d => {
      const parsed = parseInt(formData.get(`req_${d}`), 10);
      requirements[d] = isNaN(parsed) ? 0 : parsed;
    });

    setShifts(prev => [...prev, { id: generateId(), name, time, color, requirements, priority }]);
    setNewShiftColor(getRandomHex());
    e.target.reset();
  }, []);

  const removeShift = useCallback((id) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => {
      const newAss = structuredClone(prev);
      Object.keys(newAss).forEach(dateKey => {
        if (newAss[dateKey][id]) delete newAss[dateKey][id];
      });
      return newAss;
    });
    setRoles(prev => prev.map(r => ({
      ...r,
      preferredShiftId: r.preferredShiftId === id ? null : r.preferredShiftId,
      preferenceType: r.preferredShiftId === id ? 'flexible' : r.preferenceType,
      excludedShiftIds: (r.excludedShiftIds || []).filter(sId => sId !== id)
    })));
  }, []);

  const updateShift = useCallback((e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const time = formData.get('time');
    const color = formData.get('color');
    const priority = parseInt(formData.get('priority'), 10) || 10;

    const requirements = {};
    DAY_NUMBERS.forEach(d => {
      const parsed = parseInt(formData.get(`req_${d}`), 10);
      requirements[d] = isNaN(parsed) ? 0 : parsed;
    });

    setEditingShift(prev => {
      if (!prev) return null;
      setShifts(sPrev => sPrev.map(s => s.id === prev.id ? { ...s, name, time, color, requirements, priority } : s));
      return null;
    });
  }, []);

  // --- TIME OFF HANDLERS ---
  const addTimeOff = useCallback((e) => {
    e.preventDefault();
    setTimeOffError('');
    const formData = new FormData(e.target);
    const memberId = formData.get('memberId');
    const type = formData.get('type');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    if (!memberId || !startDate || !endDate) return;

    setTimeOff(prev => {
      const newTimeOff = structuredClone(prev);
      const end = new Date(endDate);

      if (type === 'holiday') {
        let conflictDateObj = new Date(startDate);
        while (conflictDateObj <= end) {
          const dKey = getDateKey(conflictDateObj.getFullYear(), conflictDateObj.getMonth(), conflictDateObj.getDate());
          if (newTimeOff[dKey]) {
            const othersOnHoliday = Object.entries(newTimeOff[dKey]).find(([id, t]) => id !== memberId && t === 'holiday');
            if (othersOnHoliday) {
              const conflictMember = members.find(m => m.id === othersOnHoliday[0]);
              setTimeOffError(`${t('conflict')}: ${conflictMember?.name || 'Another employee'} is already on holiday on ${formatDateDDMMYYYY(dKey)}.`);
              return prev;
            }
          }
          conflictDateObj.setDate(conflictDateObj.getDate() + 1);
        }
      }

      let currDate = new Date(startDate);
      while (currDate <= end) {
        const dKey = getDateKey(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());
        if (!newTimeOff[dKey]) newTimeOff[dKey] = {};
        newTimeOff[dKey][memberId] = type;
        currDate.setDate(currDate.getDate() + 1);
      }

      e.target.reset();
      return newTimeOff;
    });
  }, [members, t]);

  const removeTimeOffEntry = useCallback((dateKey, memberId) => {
    setTimeOff(prev => {
      const newTimeOff = structuredClone(prev);
      if (newTimeOff[dateKey]?.[memberId]) {
        delete newTimeOff[dateKey][memberId];
        if (Object.keys(newTimeOff[dateKey]).length === 0) delete newTimeOff[dateKey];
      }
      return newTimeOff;
    });
  }, []);

  // --- CELL & ASSIGNMENT HANDLERS ---
  const handleCellUpdate = useCallback((dateKey, memberId, newShiftId, newOffType) => {
    setAssignments(prev => {
      const newAss = structuredClone(prev);
      if (!newAss[dateKey]) newAss[dateKey] = {};
      const dayAss = newAss[dateKey];

      Object.keys(dayAss).forEach(sId => {
        dayAss[sId] = dayAss[sId].filter(id => id !== memberId);
      });

      if (newShiftId) {
        if (!dayAss[newShiftId]) dayAss[newShiftId] = [];
        dayAss[newShiftId].push(memberId);
      }

      return newAss;
    });

    setTimeOff(prev => {
      const newTimeOff = structuredClone(prev);
      if (!newTimeOff[dateKey]) newTimeOff[dateKey] = {};
      if (newOffType) newTimeOff[dateKey][memberId] = newOffType;
      else delete newTimeOff[dateKey][memberId];
      return newTimeOff;
    });

    setEditingCell(null);
  }, []);

  const clearMonth = useCallback(() => {
    setAssignments(prev => {
      const newAss = structuredClone(prev);
      daysArray.forEach(day => {
        const dateKey = getDateKey(currentYear, currentMonth, day);
        delete newAss[dateKey];
      });
      return newAss;
    });
  }, [daysArray, currentYear, currentMonth]);

  const prevMonth = useCallback(() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1)), [currentYear, currentMonth]);
  const nextMonth = useCallback(() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1)), [currentYear, currentMonth]);

  const getMemberShiftOnDate = useCallback((dateKey, memberId) => {
    if (!assignments[dateKey]) return null;
    for (const shiftId of Object.keys(assignments[dateKey])) {
      if (assignments[dateKey][shiftId].includes(memberId)) return shiftId;
    }
    return null;
  }, [assignments]);

  const getHolidaysUsed = useCallback((memberId) => {
    let count = 0;
    Object.keys(timeOff).forEach(dateKey => {
      if (dateKey.startsWith(currentYear.toString()) && timeOff[dateKey][memberId] === 'holiday') count++;
    });
    return count;
  }, [timeOff, currentYear]);

  const getMonthlyStats = useCallback((memberId) => {
    let daysWorked = 0;
    let hoursWorked = 0;

    for (let d = 1; d <= daysCount; d++) {
      const dateKey = getDateKey(currentYear, currentMonth, d);
      for (const shift of shifts) {
        if (assignments[dateKey]?.[shift.id]?.includes(memberId)) {
          daysWorked++;
          hoursWorked += calculateShiftDuration(shift.time);
          break;
        }
      }
    }
    return { shiftsWorked: daysWorked, daysOff: daysCount - daysWorked, hoursWorked: Math.round(hoursWorked * 10) / 10 };
  }, [daysCount, currentYear, currentMonth, shifts, assignments]);

  const coverageAlerts = useMemo(() => {
    const alerts = {};
    daysArray.forEach(day => {
      const dateKey = getDateKey(currentYear, currentMonth, day);
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayOfWeekNum = dateObj.getDay().toString();

      const dayAlerts = [];
      shifts.forEach(s => {
        const target = s.requirements?.[dayOfWeekNum] !== undefined ? s.requirements[dayOfWeekNum] : 1;
        if (target > 0) {
          const assigned = assignments[dateKey]?.[s.id]?.length || 0;
          if (assigned < target) dayAlerts.push({ name: s.name, assigned, target });
        }
      });
      if (dayAlerts.length > 0) alerts[dateKey] = dayAlerts;
    });
    return alerts;
  }, [daysArray, currentYear, currentMonth, shifts, assignments]);

  const value = {
    language, setLanguage, t, getDayOfWeekShortLocale,
    activeTab, setActiveTab,
    roles, setRoles, addRole, removeRole, updateRole,
    members, setMembers, addMember, removeMember, moveMemberUp, moveMemberDown, updateMember,
    shifts, setShifts, addShift, removeShift, updateShift,
    minTwoDaysOff, setMinTwoDaysOff,
    currentDate, currentYear, currentMonth, daysCount, daysArray,
    assignments, setAssignments,
    timeOff, setTimeOff, timeOffError, setTimeOffError, addTimeOff, removeTimeOffEntry,
    editingCell, setEditingCell,
    isExporting, setIsExporting,
    newShiftColor, setNewShiftColor,
    newRolePref, setNewRolePref,
    editingMember, setEditingMember,
    editingShift, setEditingShift,
    editingRole, setEditingRole,
    downloadBackup, uploadBackup,
    handleCellUpdate, clearMonth, prevMonth, nextMonth,
    getMemberShiftOnDate, getHolidaysUsed, getMonthlyStats,
    coverageAlerts,
  };

  return <RosterContext.Provider value={value}>{children}</RosterContext.Provider>;
}
