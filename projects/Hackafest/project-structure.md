# 🏗️ NFTicket Project Structure

```
NFTicket/
├── 📁 src/                         # Next.js Web Application (Frontend)
│   ├── 📁 components/              # Reusable UI Components
│   │   ├── 📁 Button/              # Button component with CSS modules
│   │   │   ├── Button.tsx          # Button component
│   │   │   └── Button.module.css   # Button-specific styles
│   │   ├── 📁 Card/                # Card component with CSS modules
│   │   │   ├── Card.tsx            # Card component
│   │   │   └── Card.module.css     # Card-specific styles
│   │   ├── 📁 NFTDisplay/          # NFT display component
│   │   │   ├── NFTDisplay.tsx      # NFT display component
│   │   │   └── NFTDisplay.module.css # NFT display styles
│   │   ├── Button.tsx              # Legacy button (to be migrated)
│   │   ├── Card.tsx                # Legacy card (to be migrated)
│   │   ├── Footer.tsx              # Footer component
│   │   ├── FormField.tsx           # Form field component
│   │   ├── Header.tsx              # Header component
│   │   ├── Layout.tsx              # Layout wrapper
│   │   └── Stepper.tsx             # Stepper component
│   │
│   ├── 📁 pages/                   # Next.js Pages (Web App)
│   │   ├── _app.tsx                # App wrapper with critical CSS
│   │   ├── index.tsx               # Landing page with NFT demo
│   │   ├── create.tsx              # NFT creation page
│   │   ├── docs.tsx                # Documentation page
│   │   ├── link.tsx                # Link verification page
│   │   ├── marketplace.tsx         # NFT marketplace
│   │   ├── verify.tsx              # Verification page
│   │   ├── nft-showcase.tsx        # NFT showcase demo page
│   │   └── 📁 legal/               # Legal pages
│   │       ├── privacy.tsx         # Privacy policy
│   │       └── terms.tsx           # Terms of service
│   │
│   ├── 📁 styles/                  # CSS Architecture
│   │   ├── globals.css             # Main CSS file with imports
│   │   ├── variables.css           # CSS custom properties
│   │   ├── reset.css               # CSS reset and base styles
│   │   ├── utilities.css           # Utility classes
│   │   ├── components.css          # Component styles
│   │   ├── sections.css            # Page section styles
│   │   ├── animations.css          # Animations and transitions
│   │   └── critical.css            # Critical above-the-fold CSS
│   │
│   ├── 📁 utils/                   # Client-side utilities
│   │   └── simulation.ts           # Wallet simulation utilities
│   └── 📁 lib/                     # Shared libraries
│
├── 📁 mobile/                      # React Native Mobile App
│   ├── 📁 src/
│   │   ├── 📁 screens/             # Mobile screens
│   │   │   ├── HomeScreen.tsx      # Main dashboard
│   │   │   ├── WalletScreen.tsx    # Wallet management
│   │   │   ├── VerificationScreen.tsx # Verification interface
│   │   │   ├── EventsScreen.tsx    # Event listings
│   │   │   ├── SettingsScreen.tsx  # App settings
│   │   │   ├── QRScannerScreen.tsx # QR code scanner
│   │   │   └── NFTDetailScreen.tsx # NFT details modal
│   │   ├── 📁 services/            # Mobile services
│   │   │   ├── WalletService.tsx   # Wallet management
│   │   │   └── NotificationService.tsx # Push notifications
│   │   ├── 📁 navigation/          # Navigation setup
│   │   │   └── AppNavigator.tsx    # Main navigation
│   │   └── 📁 types/               # TypeScript definitions
│   │       └── navigation.ts       # Navigation types
│   ├── 📁 assets/                  # Mobile assets
│   ├── App.tsx                     # Main app component
│   ├── app.json                    # Expo configuration
│   ├── package.json                # Mobile dependencies
│   └── README.md                   # Mobile app documentation
│
├── 📁 backend/                     # Node.js/Express API Server
│   ├── 📁 src/
│   │   ├── 📁 config/              # Configuration files
│   │   │   └── database.js         # MongoDB connection
│   │   ├── 📁 middleware/          # Express middleware
│   │   │   ├── errorHandler.js     # Error handling
│   │   │   └── rateLimiter.js      # Rate limiting
│   │   ├── 📁 models/              # Database models (MongoDB)
│   │   │   ├── User.js             # User model
│   │   │   ├── Verification.js     # Verification record model
│   │   │   └── Session.js          # Session model
│   │   ├── 📁 routes/              # API routes
│   │   │   ├── auth.js             # Authentication endpoints
│   │   │   ├── verification.js     # Verification endpoints
│   │   │   ├── session.js          # Session management
│   │   │   ├── nft.js              # NFT operations
│   │   │   └── collection.js       # Collection endpoints
│   │   ├── 📁 services/            # Business logic
│   │   │   ├── authService.js      # Authentication logic
│   │   │   ├── verificationService.js # Verification logic
│   │   │   ├── userService.js      # User management
│   │   │   ├── sessionService.js   # Session management
│   │   │   └── nftService.js       # NFT operations
│   │   └── index.js                # Server entry point
│   ├── package.json                # Backend dependencies
│   ├── env.example                 # Environment variables template
│   └── README.md                   # Backend API documentation
│
├── 📁 contracts/                   # Smart Contracts (Hardhat)
│   ├── 📁 contracts/               # Solidity contracts
│   ├── 📁 scripts/                 # Deployment scripts
│   ├── 📁 test/                    # Contract tests
│   ├── hardhat.config.js           # Hardhat configuration
│   └── package.json                # Contract dependencies
│
├── 📁 public/                      # Static Assets
│   ├── 📁 styles/                  # Critical CSS for performance
│   │   └── critical.css            # Critical above-the-fold CSS
│   └── nft.webp                    # Example NFT image
│
├── 📁 .claude/                     # AI Assistant cache
├── 📁 node_modules/                # Dependencies
├── 📁 .next/                       # Next.js build output
│
├── 📄 Configuration Files
├── package.json                    # Main project dependencies
├── yarn.lock                       # Dependency lock file
├── next.config.js                  # Next.js configuration
├── tsconfig.json                   # TypeScript configuration
├── docker-compose.yml              # Local development setup
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── README.md                       # Main project documentation
├── project-structure.md            # This file
└── LICENSE                         # MIT license
```

## 🎯 Key Architecture Decisions

### **Frontend (Web Dashboard)**
- **Framework**: Next.js for SSR and API routes
- **Styling**: Custom CSS with CSS Modules for component isolation
- **CSS Architecture**: Organized CSS files (variables, reset, utilities, components, sections, animations)
- **State Management**: React Context + useReducer for simplicity
- **Web3 Integration**: ethers.js + WalletConnect for wallet connections

### **CSS Architecture**
- **Variables**: CSS custom properties for consistent theming
- **Reset**: Modern CSS reset for cross-browser compatibility
- **Utilities**: Reusable utility classes for common patterns
- **Components**: Component-specific styles with CSS modules
- **Sections**: Page section styles (hero, features, etc.)
- **Animations**: Keyframe animations and transitions
- **Organization**: Modular approach for maintainability and performance

### **Mobile App**
- **Framework**: React Native + Expo for cross-platform development
- **Navigation**: React Navigation v6 with stack and tab navigators
- **State Management**: React Context + Expo SecureStore for secure data
- **Web3**: Ethers.js for blockchain interactions
- **Features**: QR scanning, biometric auth, push notifications
- **UI**: Dark theme with custom components and animations

### **Backend API**
- **Framework**: Express.js with comprehensive middleware
- **Database**: MongoDB with Mongoose ODM for data modeling
- **Authentication**: JWT + Web3 signature verification
- **Rate Limiting**: Configurable rate limits per endpoint
- **Security**: Helmet, CORS, input validation, error handling
- **Services**: Modular service architecture for business logic

### **Smart Contracts**
- **Framework**: Hardhat for development and testing
- **Standards**: OpenZeppelin ERC721 for NFT implementation
- **Network**: Conflux eSpace for main deployment
- **Features**: Mintable, Burnable, Access Control

## 🔄 Data Flow

```
1. Event Creation:
   Organizer Dashboard → Backend API → Smart Contract → Conflux Network

2. Session Management:
   Dashboard generates code → Backend stores session → WebSocket broadcasts

3. Mobile Verification:
   Mobile app → Session join → NFT proof → Backend verification → Real-time update

4. Cross-component Communication:
   WebSocket connections for real-time synchronization between dashboard and mobile
```

## 🚀 Development Phases

### **Phase 1**: Core Infrastructure
- Backend API with session management
- Smart contract deployment
- Basic mobile app structure

### **Phase 2**: User Interfaces  
- Web dashboard for organizers
- Mobile app wallet integration
- Real-time communication setup

### **Phase 3**: Integration
- End-to-end verification flow
- Account abstraction implementation
- Error handling and edge cases

### **Phase 4**: Polish
- UI/UX refinement
- Performance optimization
- Production deployment