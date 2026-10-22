/**
 * REACTFLOW - Device Shell (TECNO Camon 20 Pro Profile)
 * Provides authentic Android 14 mobile viewport ergonomics, rotation, and gesture bar
 * Created by Engineer Daniel Nwalor
 */

import React, { useState, useEffect } from 'react';
import { Wifi, Battery, RotateCw, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeviceShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { deviceOrientation, showDeviceShell } = useApp();
  const [currentTimeStr, setCurrentTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!showDeviceShell) {
    // Full bleed responsive canvas
    return (
      <div className="w-full h-screen bg-neutral-950 flex flex-col overflow-hidden text-neutral-100">
        {children}
      </div>
    );
  }

  const isLandscape = deviceOrientation === 'landscape';

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Device Body Frame (TECNO Camon 20 Pro profile) */}
      <div
        className={`relative bg-neutral-950 border-[6px] border-neutral-800 rounded-[44px] shadow-2xl ring-1 ring-white/10 flex flex-col overflow-hidden transition-all duration-300 ${
          isLandscape
            ? 'w-[854px] max-w-[96vw] h-[440px] max-h-[94vh]'
            : 'w-[393px] max-w-[96vw] h-[830px] max-h-[96vh]'
        }`}
      >
        {/* Android 14 Status Bar */}
        <div className="shrink-0 h-8 px-6 bg-neutral-950 text-neutral-400 text-xs flex items-center justify-between select-none z-30 font-medium">
          <span className="text-[11px] font-mono text-neutral-300">{currentTimeStr}</span>

          {/* Camera Punch-hole (Centered) */}
          <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-neutral-800 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
          </div>

          <div className="flex items-center gap-1.5 text-neutral-400">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Inner Screen Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </div>

        {/* Android 14 Gesture Pill at the bottom */}
        <div className="shrink-0 h-4 bg-neutral-950 flex items-center justify-center select-none pb-1">
          <div className="w-28 h-1 rounded-full bg-neutral-700" />
        </div>
      </div>
    </div>
  );
};
