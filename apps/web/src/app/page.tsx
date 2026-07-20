import React from 'react';
import { HeaderPlaceholder } from '@/components/layout/HeaderPlaceholder';
import { SidebarPlaceholder } from '@/components/layout/SidebarPlaceholder';
import { WorkspacePlaceholder } from '@/components/layout/WorkspacePlaceholder';

export default function DashboardShellPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <HeaderPlaceholder />
      <div className="flex flex-1 overflow-hidden">
        <SidebarPlaceholder />
        <WorkspacePlaceholder />
      </div>
    </div>
  );
}
