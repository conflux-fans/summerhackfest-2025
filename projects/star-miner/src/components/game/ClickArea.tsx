'use client'

import React, { useRef, useCallback } from 'react';
import { useGameStateContext } from '@/contexts/GameStateContext';

export const ClickArea: React.FC = () => {
  const {
    stardust,
    stardustPerClick,
    handleClick,
    clickEffects
  } = useGameStateContext();
  
  const clickAreaRef = useRef<HTMLDivElement>(null);

  const onStarClick = useCallback((event: React.MouseEvent) => {
    const rect = clickAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    handleClick(x, y);
  }, [handleClick]);

  return (
    <div className="relative flex-1 flex items-center justify-center">
      {/* Animated Star Field Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-animation" />
      </div>
      
      {/* Main Click Area */}
      <div
        ref={clickAreaRef}
        className="relative w-80 h-80 cursor-pointer select-none"
        onClick={onStarClick}
      >
        {/* Central Star */}
        <div className="w-full h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 flex items-center justify-center text-8xl animate-pulse-slow">
          ⭐
        </div>
        
        {/* Pulsing Ring Effect */}
        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping" />
        
        {/* Click Effects */}
        {clickEffects.map((effect) => (
          <div
            key={effect.id}
            className="floating-number text-yellow-400 font-bold text-xl"
            style={{
              left: effect.x,
              top: effect.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            +{effect.value.toLocaleString()}
          </div>
        ))}
      </div>
      
      {/* Orbital Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-blue-400/30 rounded-full animate-spin-slow"
            style={{
              width: `${400 + i * 60}px`,
              height: `${400 + i * 60}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animationDuration: `${20 + i * 10}s`,
            }}
          >
            <div
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              style={{
                top: '50%',
                right: 0,
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Stats Display */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg">
            {Number(stardust).toLocaleString()} ✨
          </div>
          <div className="text-blue-400 text-sm">
            +{Number(stardustPerClick)} per click
          </div>
        </div>
      </div>
    </div>
  );
};