// Layout constants for consistent UI sizing
import React from 'react'

export const LAYOUT = {
  // FamilyTree view dimensions - responsive heights
  FAMILLY_TREE_HEIGHT_MOBILE: 520,
  FAMILLY_TREE_HEIGHT_DESKTOP: 680,
  
  // Node dimensions
  NODE_HEIGHT: 44,
  NODE_WIDTH: 100,
  
  // Virtualized list
  ROW_HEIGHT: 40,
  
  // Spacing
  PADDING_TOP: 16,
} as const

// Utility function to get responsive familyTree height
export const getFamilyTreeHeight = () => {
  if (typeof window === 'undefined') return LAYOUT.FAMILLY_TREE_HEIGHT_DESKTOP
  return window.innerWidth < 768 ? LAYOUT.FAMILLY_TREE_HEIGHT_MOBILE : LAYOUT.FAMILLY_TREE_HEIGHT_DESKTOP
}

// React hook for responsive familyTree height
export const useFamilyTreeHeight = () => {
  const [height, setHeight] = React.useState(getFamilyTreeHeight)
  
  React.useEffect(() => {
    const updateHeight = () => setHeight(getFamilyTreeHeight())
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])
  
  return height
}
