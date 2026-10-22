/**
 * REACTFLOW - Main Application Entry
 * Live Reaction Recording Studio
 * Created by Engineer Daniel Nwalor
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceShell } from './components/device/DeviceShell';
import { TopHeader } from './components/layout/TopHeader';
import { BottomNav } from './components/layout/BottomNav';
import { HomeScreen } from './components/home/HomeScreen';
import { StudioScreen } from './components/studio/StudioScreen';
import { ProjectsScreen } from './components/projects/ProjectsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AboutScreen } from './components/about/AboutScreen';

const MainContent: React.FC = () => {
  const { currentScreen, settings } = useApp();

  const getScreenComponent = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'studio':
        return <StudioScreen />;
      case 'projects':
        return <ProjectsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'about':
        return <AboutScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const isAmoled = settings.theme === 'amoled';

  return (
    <DeviceShell>
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden ${
          isAmoled ? 'bg-black text-neutral-100' : 'bg-neutral-950 text-neutral-100'
        }`}
      >
        <TopHeader />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {getScreenComponent()}
        </main>
        <BottomNav />
      </div>
    </DeviceShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
