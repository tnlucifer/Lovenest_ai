import React, { useMemo } from 'react';

interface ParticlesProps {
  type?: 'hearts' | 'stars' | 'petals' | 'sparkles' | 'leaves' | 'vintage';
  count?: number;
  className?: string;
}

export const Particles: React.FC<ParticlesProps> = ({
  type = 'hearts',
  count = 18,
  className = '',
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 12 + 8,
      duration: Math.random() * 10 + 12,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.4 + 0.15,
      rotation: Math.random() * 360,
    }));
  }, [count]);

  const renderIcon = (type: string) => {
    switch (type) {
      case 'stars':
        return '✦';
      case 'petals':
        return '🌸';
      case 'sparkles':
        return '✨';
      case 'vintage':
        return '❦';
      case 'hearts':
      default:
        return '♥';
    }
  };

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute select-none transition-transform will-change-transform"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
            color: type === 'stars' ? '#F5D061' : type === 'vintage' ? '#8C6239' : '#C4576D',
          }}
        >
          {renderIcon(type)}
        </span>
      ))}
    </div>
  );
};
