import { useCallback } from 'react';
import { getDateKey, check11HourRest, calculateShiftDuration } from '../utils/helpers';
import { useRoster } from '../context/RosterContext';

/**
 * Parses shift start hour from a time string like "08:00 - 16:00".
 * Returns fractional hours (e.g. 8.5 for "08:30").
 */
function getShiftStartHour(timeStr) {
  if (!timeStr) return 12;
  const parts = timeStr.split(' - ');
  if (parts.length < 2) return 12;
  const [h, m] = parts[0].split(':').map(Number);
  if (isNaN(h)) return 12;
  return h + (isNaN(m) ? 0 : m / 60);
}

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
    let mandatoryRestReason = {}; // '5day' = from 5-consecutive rule, 'twoDayOff' = from min-2-days-off rule
    let currentStretchShift = {};
    let daysWorkedThisMonth = {};

    // Pre-calculate guaranteed days off per member (time off + birthdays + fixed days off)
    // so maxDaysOff logic can plan ahead. Wish days count as days off.
    const guaranteedDaysOff = {};
    members.forEach(m => {
      let count = 0;
      const mRole = roles.find(r => r.name === m.role) || { fixedDaysOff: [] };
      for (let day = 1; day <= daysCount; day++) {
        const dk = getDateKey(currentYear, currentMonth, day);
        const offType = timeOff[dk]?.[m.id];
        if (offType) { count++; continue; }
        if (m.birthday && m.birthday.substring(5) === dk.substring(5)) { count++; continue; }
        const dow = new Date(currentYear, currentMonth, day).getDay().toString();
        if ((mRole.fixedDaysOff || []).map(String).includes(dow)) { count++; }
      }
      guaranteedDaysOff[m.id] = count;
    });

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

    /** Check if a given day (1-based) will be a day off for a member (look-ahead).
     *  streakSoFar: how many consecutive days (including today) the member will
     *  have worked by the end of the current day being scheduled. */
    const willBeDayOff = (dayNum, memberId, memberObj, streakSoFar) => {
      if (dayNum > daysCount) return true; // end of month = effectively a break
      // Mandatory rest: after 5 consecutive working days the member must rest
      if (streakSoFar >= 5) return true;
      const dateKey = getDateKey(currentYear, currentMonth, dayNum);
      if (timeOff[dateKey]?.[memberId]) return true;
      if (memberObj?.birthday && memberObj.birthday.substring(5) === dateKey.substring(5)) return true;
      const mRole = roles.find(r => r.name === memberObj?.role) || { fixedDaysOff: [] };
      const dateObj = new Date(currentYear, currentMonth, dayNum);
      const dayOfWeek = dateObj.getDay().toString();
      if ((mRole.fixedDaysOff || []).map(String).includes(dayOfWeek)) return true;
      return false;
    };

    /** Check if a member is legally eligible for a shift (11h rest + role constraints). */
    const isEligibleForShift = (member, shift, day) => {
      const yesterday = new Date(currentYear, currentMonth, day - 1);
      const yDateKey = getDateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const yShiftId = getShiftOnDate(yDateKey, member.id);
      const yShiftTime = yShiftId ? shifts.find(s => s.id === yShiftId)?.time : null;

      if (!check11HourRest(yShiftTime, shift.time)) return false;

      const mRole = roles.find(r => r.name === member.role);
      if (mRole) {
        if (mRole.excludedShiftIds?.includes(shift.id)) return false;
        if (mRole.preferenceType === 'only' && mRole.preferredShiftId !== shift.id) return false;
      }
      return true;
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
      daysWorkedThisMonth[m.id] = 0;

      if (streak >= 5) {
        mandatoryDaysOff[m.id] = minTwoDaysOff ? 2 : 1;
        mandatoryRestReason[m.id] = '5day';
        consecutiveDays[m.id] = 0;
      } else {
        mandatoryDaysOff[m.id] = 0;
        mandatoryRestReason[m.id] = null;
      }
    });

    for (let d = 1; d <= daysCount; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dayOfWeekNum = dateObj.getDay().toString();
      const dateKey = getDateKey(currentYear, currentMonth, d);
      if (!newAssignments[dateKey]) newAssignments[dateKey] = {};

      const prioritizedShifts = [...shifts].sort((a, b) => (a.priority || 10) - (b.priority || 10));

      // Determine which shifts need staff today
      const activeShifts = prioritizedShifts.filter(s => {
        const target = s.requirements?.[dayOfWeekNum] !== undefined ? s.requirements[dayOfWeekNum] : 1;
        return target > 0;
      });

      let available = [];
      let mandatoryRestMembers = []; // members blocked only by 5-day consecutive rule
      members.forEach(m => {
        const isBirthday = m.birthday && m.birthday.substring(5) === dateKey.substring(5);
        const isOff = timeOff[dateKey]?.[m.id];

        const mRole = roles.find(r => r.name === m.role) || { fixedDaysOff: [] };
        const isFixedDayOff = (mRole.fixedDaysOff || []).map(String).includes(dayOfWeekNum);

        if (isBirthday || isOff || isFixedDayOff) {
          if (consecutiveDays[m.id] > 0) {
            currentStretchShift[m.id] = null;
          }
          consecutiveDays[m.id] = 0;
          if (mandatoryDaysOff[m.id] > 0) mandatoryDaysOff[m.id]--;
          return;
        }

        if (consecutiveDays[m.id] >= 5) {
          mandatoryDaysOff[m.id] = minTwoDaysOff ? 2 : 1;
          mandatoryRestReason[m.id] = '5day';
          currentStretchShift[m.id] = null;
          consecutiveDays[m.id] = 0;
        }

        if (mandatoryDaysOff[m.id] > 0) {
          const remainingBeforeDecrement = mandatoryDaysOff[m.id];
          const reason = mandatoryRestReason[m.id];
          mandatoryDaysOff[m.id]--;
          if (consecutiveDays[m.id] > 0) {
            currentStretchShift[m.id] = null;
          }
          consecutiveDays[m.id] = 0;
          // Only eligible for pull-back from the 5-consecutive-day rule,
          // and only on their last mandatory rest day (already had at least 1 day off).
          // Never pull back members resting due to the min-2-days-off rule.
          if (reason === '5day' && remainingBeforeDecrement === 1) {
            mandatoryRestMembers.push(m);
          }
          return;
        }

        available.push(m);
      });

      // Calculate minimum staffing: need at least 2 employees (earliest + latest)
      const totalMinStaffing = activeShifts.reduce((sum, s) => {
        const target = s.requirements?.[dayOfWeekNum] !== undefined ? s.requirements[dayOfWeekNum] : 1;
        return sum + Math.max(target, 0);
      }, 0);
      const minRequired = Math.max(totalMinStaffing, 2);

      // If not enough available employees, pull back mandatory-rest members
      // to guarantee minimum coverage (breaking the 5-consecutive-day rule)
      if (available.length < minRequired && mandatoryRestMembers.length > 0) {
        const deficit = minRequired - available.length;
        const pullBack = mandatoryRestMembers.slice(0, deficit);
        pullBack.forEach(m => {
          available.push(m);
        });
      }

      let workedToday = new Set();
      let assignedShiftToday = {};

      const totalDemand = activeShifts.reduce((sum, s) => {
        const target = s.requirements?.[dayOfWeekNum] !== undefined ? s.requirements[dayOfWeekNum] : 1;
        return sum + target - (newAssignments[dateKey]?.[s.id]?.length || 0);
      }, 0);
      const capacityConstrained = available.length < totalDemand && activeShifts.length > 1;

      // When capacity is constrained, drop the earliest (day) shifts first
      // and prioritize later shifts. E.g. with B(10:00), S1(16:00), ST1(18:30)
      // and only 2 available: drop B, fill S1 + ST1.
      let fillOrder;
      if (capacityConstrained) {
        const sorted = [...activeShifts].sort((a, b) => getShiftStartHour(a.time) - getShiftStartHour(b.time));
        const excess = totalDemand - available.length;
        // Drop the N earliest shifts that can't be staffed
        fillOrder = sorted.slice(excess);
      } else {
        fillOrder = prioritizedShifts;
      }

      // 1. FILL SHIFTS TO MEET REQUIREMENTS
      fillOrder.forEach(shift => {
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
          let legalCandidates = shiftAvailable.filter(m => isEligibleForShift(m, shift, d));

          if (legalCandidates.length === 0) break;

          const shiftStartHour = getShiftStartHour(shift.time);

          let scoredCandidates = legalCandidates.map(m => {
            let score = 0;
            const mRole = roles.find(r => r.name === m.role) || { preferenceType: 'flexible', excludedShiftIds: [] };

            // Role preference scoring
            if (mRole.preferenceType === 'only' && mRole.preferredShiftId === shift.id) score -= 1000;
            else if (mRole.preferenceType === 'mainly') {
              if (mRole.preferredShiftId === shift.id) score -= 500;
              else {
                // Only penalize non-preferred shifts when the preferred shift
                // actually has demand today. E.g. "mainly B" should freely do S1
                // on weekends when B has 0 requirement.
                const preferredHasDemand = activeShifts.some(s => s.id === mRole.preferredShiftId);
                if (preferredHasDemand) score += 200;
              }
            }

            // Workload balance: prefer members who have worked fewer days
            // this month to distribute shifts more evenly across the team
            score += (daysWorkedThisMonth[m.id] || 0) * 8;

            // maxDaysOff pressure: strongly prefer members who are at risk of
            // exceeding their max days off limit. The tighter the budget, the
            // stronger the pull toward working today.
            if (m.maxDaysOff) {
              const maxOff = parseInt(m.maxDaysOff, 10);
              if (!isNaN(maxOff)) {
                const worked = daysWorkedThisMonth[m.id] || 0;
                const minWorkDays = daysCount - maxOff;
                const remainingDays = daysCount - d + 1;
                const daysLeftToWork = minWorkDays - worked;
                // offBudget: how many rest days the member can still "afford"
                const offBudget = remainingDays - daysLeftToWork;
                if (offBudget <= 3) score -= (4 - offBudget) * 150; // tight → strong pull
              }
            }

            const isNewStretch = (consecutiveDays[m.id] || 0) === 0;
            const currShift = currentStretchShift[m.id];
            const allocOption = m.allocationOption;

            // --- ALLOCATION OPTION SCORING ---
            if (allocOption === '2') {
              // Option 2: Consistent shifts — prefer same shift throughout stretch
              if (!isNewStretch && currShift === shift.id) score -= 80;
              else if (!isNewStretch && currShift !== shift.id) score += 80;
            } else if (allocOption === '1') {
              // Option 1: Maximize hours at beginning and end of work stretch
              // streakIncludingToday: consecutive days if this member works today
              const streakIncludingToday = (consecutiveDays[m.id] || 0) + 1;

              if (isNewStretch) {
                // First day of stretch (after day off): prefer later/longer shifts
                // Later start = higher hour → lower score (preferred)
                score -= (shiftStartHour - 6) * 10;
              } else {
                // Check if tomorrow will be a day off (making today the last day)
                const tomorrowIsOff = willBeDayOff(d + 1, m.id, m, streakIncludingToday);
                if (tomorrowIsOff) {
                  // Last day of stretch: prefer earlier shifts
                  // Earlier start = lower hour → lower score (preferred)
                  score -= (22 - shiftStartHour) * 10;
                } else {
                  // Mid-stretch: mild consistency preference
                  if (currShift === shift.id) score -= 20;
                  else if (currShift !== shift.id) score += 20;
                }
              }
            } else {
              // No preference: mild consistency bonus (original behavior)
              if (!isNewStretch && currShift === shift.id) score -= 80;
              else if (!isNewStretch && currShift !== shift.id) score += 80;
            }

            // Discourage assigning 5th consecutive day
            if (consecutiveDays[m.id] === 4) score += 500;

            // Penalty if day off is nearby (preserve buffer around time off)
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
      // Count wish days, holidays, sick days, birthdays, and fixed days off
      // toward the days-off budget. Force work when remaining days are tight.
      available.forEach(m => {
        if (!workedToday.has(m.id) && m.maxDaysOff) {
          const maxOff = parseInt(m.maxDaysOff, 10);
          if (!isNaN(maxOff)) {
            const worked = daysWorkedThisMonth[m.id] || 0;
            // Days already off this month (not worked, not today)
            const daysElapsed = d - 1;
            const daysOffSoFar = daysElapsed - worked;
            // Future guaranteed days off (from day d+1 onward)
            let futureGuaranteedOff = 0;
            for (let fd = d + 1; fd <= daysCount; fd++) {
              const fdk = getDateKey(currentYear, currentMonth, fd);
              const offType = timeOff[fdk]?.[m.id];
              if (offType) { futureGuaranteedOff++; continue; }
              if (m.birthday && m.birthday.substring(5) === fdk.substring(5)) { futureGuaranteedOff++; continue; }
              const mRole = roles.find(r => r.name === m.role) || { fixedDaysOff: [] };
              const dow = new Date(currentYear, currentMonth, fd).getDay().toString();
              if ((mRole.fixedDaysOff || []).map(String).includes(dow)) { futureGuaranteedOff++; }
            }
            // If taking today off would exceed the budget (considering future
            // guaranteed days off), force a work assignment.
            const projectedDaysOff = daysOffSoFar + 1 + futureGuaranteedOff; // +1 = today off
            if (projectedDaysOff > maxOff) {
              let eligibleShifts = activeShifts.filter(shift => isEligibleForShift(m, shift, d));

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
              mandatoryRestReason[m.id] = '5day';
            } else if (consecutiveDays[m.id] > 0 && minTwoDaysOff) {
              mandatoryDaysOff[m.id] = 1;
              mandatoryRestReason[m.id] = 'twoDayOff';
            }
            if (consecutiveDays[m.id] > 0) {
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
