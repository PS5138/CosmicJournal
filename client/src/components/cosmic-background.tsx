export default function CosmicBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated stars background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[var(--starlight)] rounded-full animate-pulse-gentle"></div>
        <div 
          className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-[var(--cosmic-gray)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div 
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[var(--starlight)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '1s' }}
        ></div>
        <div 
          className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-[var(--cosmic-gray)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '1.5s' }}
        ></div>
        <div 
          className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-[var(--starlight)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-0.5 h-0.5 bg-[var(--cosmic-gray)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '2.5s' }}
        ></div>
        <div 
          className="absolute top-1/6 right-1/6 w-1 h-1 bg-[var(--starlight)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '3s' }}
        ></div>
        <div 
          className="absolute bottom-1/6 left-1/6 w-0.5 h-0.5 bg-[var(--cosmic-gray)] rounded-full animate-pulse-gentle" 
          style={{ animationDelay: '3.5s' }}
        ></div>
      </div>
    </div>
  );
}
