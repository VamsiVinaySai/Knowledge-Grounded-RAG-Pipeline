export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,168,83,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(232,227,218,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,227,218,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] px-4">{children}</div>
    </div>
  );
}
