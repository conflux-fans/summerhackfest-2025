/**
 * Layout Component
 * 
 * Copyright notice:
 * - TreeDeciduous icon and other icons from Lucide React (https://lucide.dev)
 * - Licensed under ISC License - allows commercial use, modification, and distribution
 * - Copyright (c) 2020, Lucide Contributors
 */

import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import PageContainer from './PageContainer'
import SiteHeader from './SiteHeader'
import FloatingActionButton from './FloatingActionButton'

export default function Layout() {
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white dark:from-gray-950 dark:to-gray-900" style={{ minHeight: '100vh' }}>
      <SiteHeader />
      <main className="pt-10 pb-16 md:pb-6">
        <PageContainer>
          <Outlet />
        </PageContainer>
      </main>
      <div className="md:hidden"><BottomNav /></div>
      <FloatingActionButton />
    </div>
  )
}


