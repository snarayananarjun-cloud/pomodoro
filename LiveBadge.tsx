export function LiveBadge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#FBF3EC',
          animation: 'pulse-dot 1.4s ease-in-out infinite',
        }}
      />
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#FBF3EC' }}>LIVE</div>
    </div>
  );
}
