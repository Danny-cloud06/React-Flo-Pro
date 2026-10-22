/**
 * REACTFLOW - Material 3 Mobile Bottom Navigation Bar
 * Created by Engineer Daniel Nwalor
 */

import React from 'react';
import { Home, Clapperboard, FolderKanban, Settings } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScreenType } from '../../types/project';

interface NavItem {
  id: ScreenType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'studio', label: 'Studio', icon: Clapperboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const { currentScreen, navigateTo } = useApp();

  // If on about screen, still highlight settings or keep nav visible
  const activeTab = currentScreen === 'about' ? 'settings' : currentScreen;

  return (
    <nav
      aria-label="Primary navigation"
      className="shrink-0 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800/80 px-2 py-1 select-none z-30"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className="flex-1 min-h-[48px] min-w-[48px] flex flex-col items-center justify-center py-1 transition-all group focus:outline-none"
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Material 3 active indicator pill */}
              <div
                className={`flex items-center justify-center w-14 h-8 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 shadow-sm shadow-sky-500/10'
                    : 'text-neutral-400 group-hover:text-neutral-200 group-hover:bg-neutral-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors whitespace-nowrap ${
                  isActive ? 'text-sky-400 font-semibold' : 'text-neutral-400 group-hover:text-neutral-300'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
