import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Image, Star, UserPlus } from 'lucide-react'

interface FloatingActionButtonProps {
  className?: string
}

export default function FloatingActionButton({ className = '' }: FloatingActionButtonProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  // Hide FAB on Actions page since FAB represents that page
  if (location.pathname === '/actions') {
    return null
  }

  const actions = [
    {
      id: 'add-version',
      label: t('actions.addVersion', 'Add Version'),
      icon: UserPlus,
      color: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
      tab: 'add-version'
    },
    {
      id: 'endorse',
      label: t('actions.endorsement', 'Endorsement'),
      icon: Star,
      color: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-green-700 dark:text-green-300',
      tab: 'endorse'
    },
    {
      id: 'mint-nft',
      label: t('actions.mintNFT', 'Mint NFT'),
      icon: Image,
      color: 'bg-purple-600 hover:bg-purple-700',
      textColor: 'text-purple-700 dark:text-purple-300',
      tab: 'mint-nft'
    }
  ]

  const handleActionClick = (tab: string) => {
    setIsOpen(false)
    navigate(`/actions?tab=${tab}`)
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Backdrop for closing menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`fixed right-3 md:right-6 z-[10000] bottom-20 md:bottom-6 ${className}`}>
        {/* Action menu items */}
        <div className={`absolute bottom-16 right-0 flex flex-col-reverse gap-3 transition-all duration-300 ease-out ${
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
        }`}>
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={action.id}
                className={`transform transition-all duration-300 ease-out ${
                  isOpen 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isOpen ? `${index * 80}ms` : '0ms'
                }}
              >
                <button
                  onClick={() => handleActionClick(action.tab)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 group transform hover:scale-105 ${action.color}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap pr-1">
                    {action.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Main FAB button */}
        <button
          onClick={toggleMenu}
          className={`w-10 h-10 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group transform hover:scale-110 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          }`}
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300" />
        </button>
      </div>
    </>
  )
}