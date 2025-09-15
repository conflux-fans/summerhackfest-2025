/**
 * DeepFamily Logo with Background Component
 * Logo with gradient background based on favicon-with-background.svg
 */
interface LogoWithBackgroundProps {
  className?: string
  size?: number
}

export default function LogoWithBackground({ className = "w-10 h-10", size }: LogoWithBackgroundProps) {
  const sizeStyle = size ? { width: size, height: size } : undefined
  
  return (
    <svg 
      className={className}
      style={sizeStyle}
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#2563eb", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#1e40af", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      <rect 
        x="0" 
        y="0" 
        width="32" 
        height="32" 
        rx="4" 
        ry="4" 
        fill="url(#bgGradient)"
      />
      
      <g transform="translate(14, 16) scale(0.8) translate(-16, -16)">
        <g
          fill="white"
          stroke="white"
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
      </g>
    </svg>
  )
}