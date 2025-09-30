'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RestartGame } from '@/components/game/RestartGame';

interface GameMenuProps {
  className?: string;
}

export const GameMenu: React.FC<GameMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className={`
          w-10 h-10 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 
          hover:bg-gray-700/80 hover:border-gray-500/50 transition-all duration-200
          flex items-center justify-center text-gray-300 hover:text-white
          ${isOpen ? 'bg-gray-700/80 border-gray-500/50 text-white' : ''}
        `}
        aria-label="Game Menu"
      >
        <div className="flex flex-col items-center justify-center w-5 h-5">
          <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-0.5' : 'mb-1'
          }`} />
          <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`} />
          <div className={`w-4 h-0.5 bg-current transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-0.5' : 'mt-1'
          }`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-48 bg-gray-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Menu Header */}
          <div className="px-4 py-3 border-b border-gray-600/50">
            <h3 className="text-sm font-semibold text-white">Game Menu</h3>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Restart Game Option */}
            <div className="px-4 py-2">
              <div className="text-xs text-gray-400 mb-2">Danger Zone</div>
              <RestartGame className="w-full" />
            </div>

            {/* Future menu items can go here */}
            <div className="border-t border-gray-600/50 mt-2 pt-2">
              <div className="px-4 py-2">
                <div className="text-xs text-gray-500 text-center">
                  More options coming soon...
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};