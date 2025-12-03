export const AmbientBackground = () => {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top,_rgba(125,102,248,0.18),transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-[radial-gradient(circle_at_bottom,_rgba(248,113,113,0.12),transparent_60%)]" />
      <div className="pointer-events-none fixed inset-0 -z-40 opacity-30" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
    </>
  );
};

