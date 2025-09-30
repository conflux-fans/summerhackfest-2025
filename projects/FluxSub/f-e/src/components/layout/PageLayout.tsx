"use client";

import { ReactNode } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import styles from '../../app/page.module.css';

interface PageLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  showNavbar?: boolean;
}

export default function PageLayout({ children, showFooter = true, showNavbar = true }: PageLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, var(--background) 0%, var(--gray-alpha-100) 100%)',
      position: 'relative'
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.03,
        backgroundImage: 'radial-gradient(circle at 2px 2px, var(--foreground) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 0
      }}></div>
      
      {showNavbar && <Navbar />}
      
      <div style={{ 
        padding: '2rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        <main className={styles.main} style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
}