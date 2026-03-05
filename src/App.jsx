import React from 'react';
import { RosterProvider, useRoster } from './context/RosterContext';
import Header from './components/Header';
import TeamTab from './components/TeamTab';
import ShiftsTab from './components/ShiftsTab';
import RolesTab from './components/RolesTab';
import TimeOffTab from './components/TimeOffTab';
import RosterTab from './components/RosterTab';
import AssignmentModal from './components/modals/AssignmentModal';
import EditMemberModal from './components/modals/EditMemberModal';
import EditShiftModal from './components/modals/EditShiftModal';
import EditRoleModal from './components/modals/EditRoleModal';

function AppContent() {
  const { activeTab } = useRoster();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 print:bg-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <style type="text/css" media="print">
        {`@page { size: landscape; margin: 10mm; }`}
      </style>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none print:w-full">
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'shifts' && <ShiftsTab />}
        {activeTab === 'roles' && <RolesTab />}
        {activeTab === 'timeoff' && <TimeOffTab />}
        {activeTab === 'roster' && <RosterTab />}
      </main>

      <AssignmentModal />
      <EditMemberModal />
      <EditShiftModal />
      <EditRoleModal />
    </div>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <AppContent />
    </RosterProvider>
  );
}
