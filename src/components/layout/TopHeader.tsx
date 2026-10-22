/**
 * REACTFLOW - App Top Header
 * Created by Engineer Daniel Nwalor
 */

import React from 'react';
import { ArrowLeft, RotateCw, Smartphone, Maximize2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopHeader: React.FC = () => {
  const {
    currentScreen,
    navigateTo,
    deviceOrientation,
    toggleDeviceOrientation,
    showDeviceShell,
    setShowDeviceShell,
  } = useApp();

  return (
    <header className="shrink-0 h-14 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 flex items-center justify-between select-none z-20">
      <div className="flex items-center gap-2.5 min-w-0">
        {currentScreen === 'about' ? (
          <button
            onClick={() => navigateTo('settings')}
            className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-neutral-300 hover:text-white rounded-lg active:bg-neutral-800 transition-colors"
            aria-label="Back to Settings"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <img
            src="/app-icon.jpg"
            alt="RF Logo"
            className="w-8 h-8 rounded-lg object-cover border border-sky-500/30 shadow-sm shrink-0"
          />
        )}

        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
              REACTFLOW
            </span>
            <span className="hidden sm:inline text-[10px] text-neutral-500 font-medium tracking-wide uppercase">
              STUDIO
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 truncate tracking-wide">
            LIVE REACTION RECORDING STUDIO
          </span>
        </div>
      </div>

      {/* Top right quick actions: Rotation toggle & Phone/Full view */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={toggleDeviceOrientation}
          title={`Rotate orientation (currently ${deviceOrientation})`}
          className="min-h-[40px] px-2.5 rounded-lg flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
          aria-label="Rotate device orientation"
        >
          <RotateCw className="w-4 h-4 text-sky-400" />
          <span className="hidden xs:inline text-[11px] capitalize">{deviceOrientation}</span>
        </button>

        <button
          onClick={() => setShowDeviceShell(!showDeviceShell)}
          title={showDeviceShell ? 'Switch to Full Width Mode' : 'Switch to TECNO Device Frame'}
          className="min-h-[40px] px-2.5 rounded-lg flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
          aria-label="Toggle device frame"
        >
          {showDeviceShell ? (
            <>
              <Maximize2 className="w-4 h-4 text-neutral-400" />
              <span className="hidden sm:inline text-[11px]">Full Bleed</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline text-[11px]">Phone Frame</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
