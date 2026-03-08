# Team Roster Planner - User Manual

## Table of Contents

1. [Overview](#overview)
2. [Navigation](#navigation)
3. [Managing Roles & Rules](#managing-roles--rules)
4. [Managing Shifts](#managing-shifts)
5. [Managing Team Members](#managing-team-members)
6. [Time Off & Leave Management](#time-off--leave-management)
7. [Monthly Roster Schedule](#monthly-roster-schedule)
8. [Auto-Scheduler](#auto-scheduler)
9. [Export & Data Management](#export--data-management)
10. [Workflow Example](#workflow-example)
11. [Troubleshooting](#troubleshooting)

---

## Overview

Team Roster Planner is a scheduling application for managing monthly team rosters. It supports shift definitions with per-day staffing targets, role-based assignment rules, automated scheduling, and PDF export. The interface is available in English and German.

All data is automatically saved to your browser's local storage and persists across sessions.

---

## Navigation

The application has 5 main tabs accessible from the top navigation bar:

| Tab | Icon | Purpose |
|-----|------|---------|
| **Monthly Roster** | Calendar | Core scheduling view |
| **Manage Team** | Users | Team member administration |
| **Manage Shifts** | Clock | Shift type definitions |
| **Roles & Rules** | Shield | Role configuration and assignment rules |
| **Leaves & Holidays** | Sun | Time off and leave management |

### Top-Right Controls

- **Language Selector**: Switch between English (EN) and German (DE)
- **Save Data**: Download a JSON backup file of all roster data
- **Load Data**: Upload a previously saved JSON backup to restore data

---

## Managing Roles & Rules

> **Important**: Create roles before adding team members. Members must be assigned a role.

### Creating a Role

1. Go to the **Roles & Rules** tab
2. Fill in:
   - **Role Name**: e.g. "Team Leader", "Employee"
   - **Priority Target**: How shifts are assigned to this role
     - **Flexible (No Preference)**: Can work any shift
     - **Mainly (Prioritize a shift)**: Prefers one shift but can work others. A dropdown appears to select the preferred shift
     - **Only (Exclusive)**: Can only work the selected shift
   - **Hard Exclusions**: Check shifts this role should **never** be assigned to
   - **Fixed Days Off**: Check days of the week when this role is always off (e.g. Saturday, Sunday)
3. Click **Create Role**

### Editing / Deleting

- Click the **pencil** icon to edit a role. If the role name changes, all members with that role are updated automatically.
- Click the **trash** icon to delete a role.

---

## Managing Shifts

### Creating a Shift

1. Go to the **Manage Shifts** tab
2. Fill in:
   - **Shift Name**: e.g. "B", "S1", "ST1"
   - **Time**: Time range in format `HH:MM - HH:MM` (e.g. `08:00 - 16:00`). Overnight shifts are supported (e.g. `19:00 - 04:00`)
   - **Color**: Pick a color for visual identification in the roster
   - **Priority** (1-99, default 10): Lower number = filled first by the auto-scheduler
   - **Staffing Targets**: Set how many people are needed for each day of the week (0 = shift not active on that day)
3. Click **Add**

### Shift Duration

Net hours are automatically calculated accounting for Swiss labor law break deductions:

| Shift Length | Break Deducted |
|---|---|
| > 9 hours | 1 hour |
| > 7 hours | 45 minutes |
| > 5.5 hours | 15 minutes |

### Editing / Deleting

- Click the **pencil** icon to edit. Changes apply to all existing assignments.
- Click the **trash** icon to delete. All assignments using that shift are removed.

---

## Managing Team Members

### Adding a Team Member

1. Go to the **Manage Team** tab
2. Fill in:
   - **Full Name** (required)
   - **Role** (required): Select from existing roles
   - **Max Days Off** (optional): Maximum rest days allowed per month. The auto-scheduler will force work assignments if a member risks exceeding this limit
   - **Allocation Option** (optional): Controls how the auto-scheduler assigns shifts within a work stretch
     - **No Preference**: Default flexible assignment
     - **Maximize rest between stretches**: Later/longer shifts at the start of a stretch, earlier shifts at the end — maximizes continuous rest hours between work periods
     - **Consistent shifts**: Same shift type throughout a work stretch (e.g. S1 every day)
   - **Birthday** (optional): The member gets an automatic day off on their birthday
3. Click **Add**

A color is automatically assigned for visual identification.

### Reordering Members

Use the **up/down arrows** beside each member to change the display order in the roster grid.

### Editing / Deleting

- Click the **pencil** icon to edit any field
- Click the **trash** icon to remove. All assignments for that member are deleted

---

## Time Off & Leave Management

### Booking Time Off

1. Go to the **Leaves & Holidays** tab
2. Select:
   - **Team Member**
   - **Type**: Holiday, Sick Day, or Wish Day
   - **Start Date** and **End Date**
3. Click **Book**

### Conflict Rules

- **Holiday**: Only **one person** can be on holiday on any given day. A red error appears if there is a conflict.
- **Sick Day / Wish Day**: No limit — multiple people can have the same type on the same day.

### Viewing & Removing

All booked time off is listed chronologically. Click the **trash** icon to remove an entry.

### How Time Off Appears in the Roster

| Code | Color | Meaning |
|------|-------|---------|
| HOL | Orange | Holiday |
| SICK | Red | Sick day |
| WSH | Pink | Wish day |
| B-DAY | Indigo | Birthday |

These days cannot be overwritten by the auto-scheduler.

---

## Monthly Roster Schedule

### Layout

- **Rows**: One per team member (sticky names on the left)
- **Columns**: One per calendar day
- **Column headers**: Day number + day of week
- **Friday/Saturday columns** are highlighted in blue
- **Shift Legend** at the top shows all shifts with their colors and times

### Assigning Shifts Manually

Click any cell to open the assignment modal. Options include:

- **OFF**: Rest day (green)
- **HOL / SICK / WSH**: Time off types
- All configured **shifts** (displayed with name and time)

The currently assigned option is highlighted. Click to change, or click Cancel to close.

> Cells for birthdays and fixed days off (from role rules) are locked and cannot be clicked.

### Coverage Alerts

A row at the bottom of the schedule shows **red warnings** when a day is understaffed. Format: `ShiftName: 1/2` means 1 person assigned but 2 are required.

### Leave & Events Row

Below the schedule, a row displays all events per day using member initials and type icons (birthdays, holidays, sick days, wish days). This row is informational and excluded from PDF export.

### Monthly Summary

Cards at the bottom show per-member statistics:

- **Shifts**: Number of shifts worked
- **Hours**: Total net hours worked
- **Rest**: Days off (excluding time off)
- **Holidays / Sick / Wish**: Count of each leave type

### Month Navigation

- **Left/Right arrows** beside the month name to navigate months
- **Clear Month**: Red button — removes **all** assignments for the visible month (time off and configuration are preserved)

---

## Auto-Scheduler

Click the **Auto-Schedule** button (teal) in the toolbar to automatically fill the entire month.

### Rules Applied (in order of priority)

1. **Pre-existing assignments are preserved** — the scheduler only fills empty cells
2. **Birthdays, time off, and fixed days off** are always respected
3. **Hard exclusions** from roles are never violated
4. **"Only" roles** are exclusively assigned to their designated shift
5. **11-hour rest** between consecutive shifts is enforced (Swiss labor law)
6. **Maximum 5 consecutive working days** — after 5 days, a mandatory rest day is given
7. **Min 2 Days Off** (toggle in toolbar): When enabled, every work stretch is followed by at least 2 consecutive rest days
8. **Workload balance**: Members who have worked fewer days are preferred, distributing shifts evenly
9. **Role preferences**: "Mainly" roles are strongly preferred for their designated shift. On days when the preferred shift has no demand (e.g. weekends), the penalty is removed so the member can freely work other shifts
10. **Staffing targets**: Each shift's per-day requirement is met if enough eligible members are available
11. **Minimum 2 employees per day**: If fewer than 2 members are available, the 5-consecutive-day rule may be broken (but the 2-days-off rule is never broken)
12. **Max Days Off**: Members approaching their limit are forced to work remaining days
13. **Allocation options** control shift selection within work stretches (see Team Members section)

### Capacity Constraints

When there are fewer available members than total shift demand, the scheduler prioritizes:
1. **Earliest shift** (e.g. morning)
2. **Latest shift** (e.g. night)
3. Mid-day shifts last

### After Auto-Scheduling

- Review the **Coverage Alerts** row for any unfilled positions
- Check the **Monthly Summary** for fair distribution
- Manually adjust any cells as needed

---

## Export & Data Management

### Export PDF

Click **Export PDF** in the toolbar to generate a landscape A4 PDF containing:

- Month and year title
- Shift legend
- Complete roster table with all assignments
- Monthly summary statistics

The **Leave & Events** and **Coverage Alerts** rows are excluded from the PDF. The file is named `Team_Roster_[Month]_[Year].pdf`.

### Save / Load Data

- **Save Data** (top-right): Downloads a `TeamRoster_Backup_[YYYY-MM-DD].json` file containing all configuration and schedule data
- **Load Data** (top-right): Upload a previously saved JSON file to restore everything

### Automatic Persistence

All changes are automatically saved to browser local storage (with a 1-second delay). Data survives browser restarts. However:

- Clearing browser data will erase the roster
- Private/incognito mode may not persist data
- Use **Save Data** periodically for backup safety

---

## Workflow Example

### Setting Up a New Schedule

1. **Create Roles** (Roles & Rules tab)
   - e.g. "Team Leader": Mainly B shift, excluded from ST1 and S2
   - e.g. "Employee": Flexible, excluded from B

2. **Create Shifts** (Manage Shifts tab)
   - e.g. B: 10:00-19:00, priority 10, Mon-Fri: 2, Sat-Sun: 0
   - e.g. S1: 16:00-01:00, priority 10, daily: 1
   - Set staffing targets per day of week

3. **Add Team Members** (Manage Team tab)
   - Assign roles, set max days off (e.g. 10), choose allocation option, enter birthdays

4. **Book Time Off** (Leaves & Holidays tab)
   - Enter approved holidays, known sick days, wish days

5. **Generate Schedule** (Monthly Roster tab)
   - Enable **Min 2 Days Off** if desired
   - Click **Auto-Schedule**
   - Review coverage alerts and monthly summary
   - Manually adjust as needed

6. **Export**
   - Click **Export PDF** for printing/sharing
   - Click **Save Data** for backup

---

## Troubleshooting

### "Add Roles First" when adding members
You must create at least one role before adding team members. Go to the Roles & Rules tab first.

### Auto-scheduler leaves shifts unfilled
- Check that staffing targets aren't set higher than available staff
- Verify role exclusions aren't blocking all eligible members from a shift
- Ensure the min-2-days-off toggle isn't over-constraining the schedule
- Check if too many members have time off on the same day

### Holiday booking shows a conflict error
Only one person can be on holiday on any given day. Check who is already booked and adjust dates. Sick days and wish days have no such limit.

### Coverage alerts showing after auto-schedule
This indicates demand exceeds supply for that day. Common causes:
- More shift positions than team members (e.g. 5 positions but only 4 people)
- Too many members on mandatory rest simultaneously
- Role exclusions limiting who can fill certain shifts

### Data appears lost
- Browser data clearing removes local storage. Always use **Save Data** for backups
- Private/incognito windows may not persist storage
- Use **Load Data** to restore from a backup file
