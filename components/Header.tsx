import React from 'react';
import { Territory } from '../types';

interface HeaderProps {
    territory?: Territory;
    setTerritory: (t: Territory | undefined) => void;
}

export const Header: React.FC<HeaderProps> = ({ territory, setTerritory }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            {/* Logo Placeholder - APRA AMCOS Style: Black and Yellow */}
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-yellow-400 font-bold text-xs shadow-md border border-gray-900 shrink-0">
                APRA
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">APRA AMCOS Production Music Quote Agent</h1>
                <p className="text-xs text-gray-500 hidden sm:block">2025 Rate Card • Australia & New Zealand</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <select 
                    value={territory || ''}
                    onChange={(e) => setTerritory(e.target.value as Territory || undefined)}
                    className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    <option value="">🌏 Select Location</option>
                    <option value="Australia">🇦🇺 Australia</option>
                    <option value="New Zealand">🇳🇿 New Zealand</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                </div>
            </div>

            <a 
                href="https://www.apraamcos.com.au/production-music" 
                target="_blank" 
                rel="noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-yellow-400 hover:text-gray-900 transition-colors text-xs font-bold uppercase tracking-wide"
                title="Get Assistance"
            >
                <i className="fa-solid fa-headset"></i>
                <span>Contact Us</span>
            </a>
        </div>
      </div>
    </header>
  );
};