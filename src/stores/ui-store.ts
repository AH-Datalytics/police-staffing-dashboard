'use client';

import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  activeDistrict: string | null; // null = all districts
  animationHour: number;
  animationPlaying: boolean;
  controlsPanelOpen: boolean;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveDistrict: (district: string | null) => void;
  setAnimationHour: (hour: number) => void;
  setAnimationPlaying: (playing: boolean) => void;
  toggleControlsPanel: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeDistrict: null,
  animationHour: 0,
  animationPlaying: false,
  controlsPanelOpen: true,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveDistrict: (district) => set({ activeDistrict: district }),
  setAnimationHour: (hour) => set({ animationHour: hour }),
  setAnimationPlaying: (playing) => set({ animationPlaying: playing }),
  toggleControlsPanel: () => set((s) => ({ controlsPanelOpen: !s.controlsPanelOpen })),
}));
