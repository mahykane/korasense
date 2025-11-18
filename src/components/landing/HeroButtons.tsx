'use client';

export default function HeroButtons() {
  return (
    <div className="flex gap-4 justify-center">
      <a href="/sign-in" className="btn-primary">
        Sign In
      </a>
      <a href="/sign-up" className="btn-secondary">
        Sign Up
      </a>
      <a 
        href="/demo"
        style={{
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          fontWeight: 600,
          padding: '0.625rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--accent-20)',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-20)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--accent-light)';
        }}
      >
        Try Demo
      </a>
    </div>
  );
}
