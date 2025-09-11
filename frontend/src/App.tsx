import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from './components/Layout'
import Home from './pages/Home'
import VisualizationPage from './pages/VisualizationPage'
import SearchPage from './pages/SearchPage'
import PersonPage from './pages/PersonPage'
import PeoplePage from './pages/PeoplePage'
import StoryEditorPage from './pages/StoryEditorPage'
import ActionsPage from './pages/ActionsPage'
import { ConfigProvider } from './context/ConfigContext'
import { ToastProvider } from './components/ToastProvider'
import { VizOptionsProvider } from './context/VizOptionsContext'
import { TreeDataProvider } from './context/TreeDataContext'
import { WalletProvider } from './context/WalletContext'

function TitleUpdater() {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  useEffect(() => {
    const getPageTitle = () => {
      const baseName = 'DeepFamily'
      switch (location.pathname) {
        case '/':
          return `${baseName} - ${t('home.title')}`
        case '/visualization':
          return `${baseName} - ${t('navigation.visualization')}`
        case '/search':
          return `${baseName} - ${t('navigation.search')}`
        case '/people':
          return `${baseName} - ${t('navigation.people')}`
        case '/actions':
          return `${baseName} - ${t('navigation.actions', 'Actions')}`
        default:
          if (location.pathname.startsWith('/person/')) {
            return `${baseName} - ${t('person.pageTitle', 'Person Biography')}`
          }
          if (location.pathname.startsWith('/editor/')) {
            return `${baseName} - ${t('storyEditor.title', 'Story Editor')}`
          }
          return `${baseName} - ${t('home.title')}`
      }
    }

    document.title = getPageTitle()
  }, [location.pathname, t, i18n.language])

  return null
}

function RouterContent() {
  return (
    <VizOptionsProvider>
      {/* TreeDataProvider no longer needs traversal/includeX props; it reads VizOptions context directly */}
      <TreeDataProvider>
        {/* Base routes */}
        <Routes>
          <Route path="/" element={<Layout />}> 
            <Route index element={<Home />} />
            <Route path="visualization" element={<VisualizationPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="actions" element={<ActionsPage />} />
            {/* Person and Editor under Layout to keep header/footer */}
            <Route path="person/:tokenId" element={<PersonPage />} />
            <Route path="editor/:tokenId" element={<StoryEditorPage />} />
          </Route>
        </Routes>
      </TreeDataProvider>
    </VizOptionsProvider>
  )
}

export default function App() {
  return (
    <ConfigProvider>
      <ToastProvider>
        <WalletProvider>
          <BrowserRouter>
            <TitleUpdater />
            <RouterContent />
          </BrowserRouter>
        </WalletProvider>
      </ToastProvider>
    </ConfigProvider>
  )
}
