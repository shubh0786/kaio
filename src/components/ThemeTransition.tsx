import { Moon, Sun } from 'lucide-react';

interface ThemeTransitionProps {
  animTarget: boolean;
}

export default function ThemeTransition({ animTarget }: ThemeTransitionProps) {
  return (
    <>
      <div
        className="theme-wipe"
        style={{ background: animTarget ? '#0f1419' : '#ffffff' }}
      />

      <div className="theme-stage">
        <div className="theme-glow" style={{ borderColor: animTarget ? '#5eead4' : '#14b8a6' }} />

        <svg className="theme-rays-svg" viewBox="0 0 200 200">
          {animTarget
            ? [[40, 30], [160, 25], [25, 140], [170, 155], [100, 15], [60, 170], [15, 90], [185, 100], [130, 20], [70, 180], [20, 60], [180, 140]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 2.5 : 1.5} fill="#5eead4" className="theme-star" style={{ animationDelay: `${0.3 + i * 0.04}s` }} />
            ))
            : [...Array(12)].map((_, i) => (
              <line key={i} x1="100" y1="12" x2="100" y2="32" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round"
                transform={`rotate(${i * 30} 100 100)`} className="theme-ray-line" style={{ animationDelay: `${0.25 + i * 0.03}s` }} />
            ))}
        </svg>

        <div className="theme-particles">
          {[
            { x: 80, y: -90 }, { x: -70, y: -80 }, { x: 95, y: 60 }, { x: -85, y: 75 },
            { x: 40, y: -110 }, { x: -100, y: -20 }, { x: 110, y: 20 }, { x: -40, y: 100 },
            { x: 60, y: 85 }, { x: -55, y: -95 }, { x: -90, y: 50 }, { x: 75, y: -60 },
          ].map((p, i) => (
            <div key={i} className="theme-dot"
              style={{
                background: animTarget ? '#5eead4' : '#14b8a6',
                '--tx': `${p.x}px`, '--ty': `${p.y}px`,
                animationDelay: `${0.28 + i * 0.03}s`,
                width: i % 3 === 0 ? '6px' : '4px',
                height: i % 3 === 0 ? '6px' : '4px',
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="theme-icon-main" style={{ color: animTarget ? '#5eead4' : '#14b8a6' }}>
          {animTarget ? <Moon size={52} strokeWidth={1.5} /> : <Sun size={52} strokeWidth={1.5} />}
        </div>
      </div>
    </>
  );
}
