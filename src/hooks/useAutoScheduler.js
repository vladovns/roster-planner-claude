import { useCallback } from 'react';
import { getDateKey, check11HourRest } from '../utils/helpers';
import { useRoster } from '../context/RosterContext';

export function useAutoScheduler() {
  const {
    members, shifts, roles, assignments, setAssignments,
    timeOff, minTwoDaysOff,
    currentYear, currentMonth, daysCount,
  } = useRoster();

  const autoSchedule = useCallback(() => {
    const newAssignments = structuredClone(assignments);

    let consecutiveDays = {};
    let mandatoryDaysOff = {};
    let currentStretchShift = {};
    let lastStretchShift = {};
    let daysWorkedThisMonth = {};

    const getShiftOnDate = (dateKey, memberId) => {
      const source = newAssignments[dateKey] || assignments[dateKey];
      if (!source) return null;
      for (const sId of Object.keys(source)) {
        if (source[sId].includes(memberId)) return sId;
      }
      return null;
    };

    const wasDayOff = (dateKey, memberId, memberObj) => {
      if (timeOff[dateKey]?.[memberId]) return true;
      if (memberObj?.birthday && memberObj.birthday.substring(5) === dateKey.substring(5)) return true;
      const mRole = roles.find(r => r.name === memberObj?.role) || { fixedDaysOff: [] };
      const dateObj = new Date(dateKey + 'T12:00:00');
      const dayNum = dateObj.getDay().toString();
      if ((mRole.fixedDaysOff || []).map(String).includes(dayNum)) return true;
      return false;
    };

    // Cross-month initialization
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0);

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

      const prioritizedShifts = [...shifts].sort((a, b) => (a.priority || 10) - (b.priority || 10));

      // 1. FILL SHIFTS TO MEET REQUIREMENTS
      prioritizedShifts.forEach(shift => {
        const target = shift.requirements?.[dayOfWeekNum] !== undefined ? shift.requirements[dayOfWeekNum] : 1;
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
              if (mRole.excludedShiftIds?.includes(shift.id)) return false;
              if (mRole.preferenceType === 'only' && mRole.preferredShiftId !== shift.id) return false;
            }
            return true;
          });

          if (legalCandidates.length === 0) break;

          let scoredCandidates = legalCandidates.map(m => {
            let score = 0;
            const mRole = roles.find(r => r.name === m.role) || { preferenceType: 'flexible', excludedShiftIds: [] };

            if (mRole.preferenceType === 'only' && mRole.preferredShiftId === shift.id) score -= 1000;
            else if (mRole.preferenceType === 'mainly') {
              if (mRole.preferredShiftId === shift.id) score -= 500;
              else score += 200;
            }

            const isNewStretch = (consecutiveDays[m.id] || 0) === 0;
            const currShift = currentStretchShift[m.id];

            if (!isNewStretch && currShift === shift.id) score -= 80;
            else if (!isNewStretch && currShift !== shift.id) score += 80;

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
                  if (mRole.excludedShiftIds?.includes(shift.id)) return false;
                  if (mRole.preferenceType === 'only' && mRole.preferredShiftId !== shift.id) return false;
                }
                return true;
              });

              if (eligibleShifts.length > 0) {
                eligibleShifts.sort((a, b) => {
                  const mRole = roles.find(r => r.name === m.role);
                  if (mRole?.preferredShiftId === a.id) return -1;
                  if (mRole?.preferredShiftId === b.id) return 1;
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
  }, [members, shifts, roles, assignments, timeOff, minTwoDaysOff, currentYear, currentMonth, daysCount, setAssignments]);

  return autoSchedule;
}
