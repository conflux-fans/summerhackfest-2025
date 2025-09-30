/**
 * DeepFamily Logo Component
 * Custom tree-based logo for the DeepFamily application
 */
interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = "w-10 h-10", size }: LogoProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined
  
  return (
    <svg 
      className={className}
      style={sizeStyle}
      viewBox="4 2 32 28" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M 8 6
             L 20 6
             C 24 6, 28 10, 28 16
             C 28 22, 24 26, 20 26
             L 8 26"
          fill="none"
        />
        
        <line
          x1="8"
          y1="16"
          x2="32"
          y2="16"
        />
      </g>
    </svg>
  )
}