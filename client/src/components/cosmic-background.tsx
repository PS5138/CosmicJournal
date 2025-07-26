import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
}

export default function CosmicBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starColors = [
        'var(--starlight)',
        'var(--cosmic-gray)',
        'var(--stellar-blue)',
        'var(--cosmic-purple)',
        'var(--aurora-green)',
      ];

      const newStars: Star[] = [];
      for (let i = 0; i < 120; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          brightness: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 3 + 1,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
      setStars(newStars);
    };

    generateStars();

    // Mouse move handler for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Starfield */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
        }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              opacity: star.brightness,
              animation: `pulse-gentle ${star.twinkleSpeed}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              transform: `translate(${mousePosition.x * star.size * 0.1}px, ${mousePosition.y * star.size * 0.1}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        <div 
          className="absolute w-px h-px bg-[var(--starlight)] rounded-full opacity-0"
          style={{
            top: '20%',
            left: '10%',
            animation: 'shooting-star 8s linear infinite',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute w-px h-px bg-[var(--stellar-blue)] rounded-full opacity-0"
          style={{
            top: '60%',
            left: '80%',
            animation: 'shooting-star 12s linear infinite',
            animationDelay: '6s',
          }}
        />
        <div 
          className="absolute w-px h-px bg-[var(--cosmic-purple)] rounded-full opacity-0"
          style={{
            top: '40%',
            left: '5%',
            animation: 'shooting-star 15s linear infinite',
            animationDelay: '10s',
          }}
        />
      </div>

      {/* Nebula effect */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-[var(--cosmic-purple)]/30 via-[var(--stellar-blue)]/10 to-transparent rounded-full blur-3xl"
          style={{
            top: '20%',
            left: '70%',
            animation: 'nebula-drift 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-radial from-[var(--aurora-green)]/20 via-[var(--cosmic-purple)]/5 to-transparent rounded-full blur-3xl"
          style={{
            bottom: '30%',
            left: '10%',
            animation: 'nebula-drift 25s ease-in-out infinite reverse',
          }}
        />
      </div>
    </div>
  );
}
