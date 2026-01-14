export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* The Grid */}
      <div className="absolute inset-0 grid-bg opacity-30"></div>

      {/* The Beam Scanner */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="beam w-full h-[50vh]"></div>
      </div>

      {/* Floating Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-sky-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob opacity-40"></div>
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000 opacity-30"></div>
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000 opacity-30"></div>
    </div>
  );
}
