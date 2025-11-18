'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

interface NavigationProps {
  user: {
    name: string | null;
    email: string;
  };
}

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/knowledge', label: 'Documents', icon: '📚' },
    { href: '/chat', label: 'Ask Questions', icon: '💬' },
  ];
  
  return (
    <nav style={{ 
      backgroundColor: 'var(--bg-elevated)', 
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ 
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1.5rem',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              href="/dashboard" 
              style={{ 
                fontSize: '1.25rem', 
                fontWeight: 700,
                color: 'var(--accent)',
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🔷</span>
              <span>KORASENSE</span>
            </Link>
            
            <div className="hidden md:flex" style={{ 
              display: 'flex',
              gap: '0.5rem'
            }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    backgroundColor: pathname === item.href ? 'var(--accent-light)' : 'transparent',
                    color: pathname === item.href ? 'var(--accent)' : 'var(--text-secondary)',
                    border: pathname === item.href ? '1px solid var(--accent-20)' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-tertiary)',
              fontWeight: 500
            }} className="hidden sm:block">
              {user.name || user.email}
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  );
}
