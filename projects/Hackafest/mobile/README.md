# NFTicket Mobile App

A React Native mobile application for NFT ownership verification and real-world access management.

## Features

- **Wallet Integration**: Connect and manage Conflux wallets
- **NFT Display**: View and manage your NFT collection
- **Verification**: Verify NFT ownership through multiple methods
- **QR Code Scanning**: Scan QR codes for instant verification
- **Session Codes**: Generate and verify 6-digit session codes
- **Event Management**: View events that require NFT verification
- **Real-time Notifications**: Get notified about verification status

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Camera** for QR code scanning
- **Expo Secure Store** for secure data storage
- **Ethers.js** for blockchain interactions
- **React Native Vector Icons** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

3. Run on device/simulator:
```bash
# iOS
npm run ios
# or
yarn ios

# Android
npm run android
# or
yarn android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── services/           # API and business logic
│   ├── navigation/         # Navigation configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── assets/                 # Images, fonts, and other assets
├── App.tsx                 # Main app component
├── app.json               # Expo configuration
└── package.json           # Dependencies and scripts
```

## Key Features

### Wallet Management
- Connect/disconnect Conflux wallets
- View wallet balance and address
- Secure storage of wallet data

### NFT Verification
- **Signature Verification**: Sign messages to prove ownership
- **Session Codes**: Generate 6-digit codes for verifiers
- **QR Code Scanning**: Scan QR codes for instant verification
- **NFC Support**: Near-field communication verification

### User Interface
- Dark theme optimized for mobile
- Responsive design for all screen sizes
- Smooth animations and transitions
- Intuitive navigation

## API Integration

The mobile app connects to the NFTicket backend API for:
- User authentication
- NFT data retrieval
- Verification processing
- Session management
- Event information

## Security Features

- **Biometric Authentication**: Secure app access
- **Encrypted Storage**: Sensitive data is encrypted
- **Secure Communication**: HTTPS API calls
- **Non-custodial**: Private keys never leave the device

## Development

### Code Style
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions

### Testing
```bash
# Run tests
npm test
# or
yarn test
```

### Building for Production

#### iOS
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

## Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3001/api
CONFLUX_RPC_URL=https://evmtestnet.confluxrpc.com
```

### App Configuration
Edit `app.json` to customize:
- App name and version
- Bundle identifiers
- Permissions
- Icons and splash screens

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **iOS build issues**: Clean Xcode build folder
3. **Android build issues**: Clean gradle cache
4. **Permission issues**: Check app.json permissions

### Debug Mode
Enable debug mode in `App.tsx` for additional logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
