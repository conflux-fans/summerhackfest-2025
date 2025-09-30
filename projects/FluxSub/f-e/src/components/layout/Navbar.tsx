"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import SimpleConnectButton from '../SimpleConnectButton';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/merchant', label: 'Merchant' }
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(var(--background-rgb, 255, 255, 255), 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--gray-alpha-200)',
      padding: '1rem 0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: 'none',
          fontSize: '1.5rem',
          fontWeight: '700',
          fontFamily: 'var(--font-geist-sans)',
          background: 'linear-gradient(135deg, var(--foreground), #666)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          FluxSub
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: pathname === item.href ? '600' : '500',
                  fontFamily: 'var(--font-geist-sans)',
                  color: pathname === item.href ? 'var(--foreground)' : 'rgba(var(--foreground), 0.7)',
                  transition: 'color 0.2s ease',
                  position: 'relative'
                }}
              >
                {item.label}
                {pathname === item.href && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(135deg, #3b82f6, #10b981)',
                    borderRadius: '1px'
                  }}></div>
                )}
              </a>
            ))}
          </div>

          {/* Wallet Connection */}
          <SimpleConnectButton />
        </div>
      </div>
    </nav>
  );
}