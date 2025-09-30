# NFTicket Backend API

A Node.js/Express backend API for NFT ownership verification and real-world access management.

## Features

- **User Authentication**: Wallet-based authentication with signature verification
- **NFT Verification**: Verify NFT ownership on Conflux blockchain
- **Session Management**: Generate and verify 6-digit session codes
- **Collection Management**: Manage NFT collections and metadata
- **Rate Limiting**: Protect against abuse with configurable rate limits
- **Real-time Updates**: WebSocket support for live verification updates

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Ethers.js** for blockchain interactions
- **Redis** for caching and sessions
- **Socket.io** for real-time communication
- **Winston** for logging

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Redis 6.0+
- npm or yarn

### Installation

1. Clone the repository and navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Start MongoDB and Redis services

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /auth/nonce
Generate nonce for wallet authentication
```json
{
  "walletAddress": "0x742d35cc61b8000000000000000000000000000"
}
```

#### POST /auth/verify
Verify signature and authenticate
```json
{
  "walletAddress": "0x742d35cc61b8000000000000000000000000000",
  "signature": "0x...",
  "nonce": "abc123..."
}
```

### Verification Endpoints

#### POST /verification/verify
Verify NFT ownership
```json
{
  "walletAddress": "0x742d35cc61b8000000000000000000000000000",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "tokenId": "42",
  "eventName": "VIP Conference Access",
  "location": "Convention Center",
  "verificationMethod": "signature",
  "signature": "0x..."
}
```

#### GET /verification/history
Get verification history
```
GET /verification/history?walletAddress=0x...&limit=10&offset=0
```

### Session Endpoints

#### POST /session/generate
Generate session code
```json
{
  "walletAddress": "0x742d35cc61b8000000000000000000000000000",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "eventName": "VIP Conference Access",
  "location": "Convention Center",
  "expiresInMinutes": 60
}
```

#### POST /session/verify
Verify session code
```json
{
  "sessionCode": "123456",
  "verifierInfo": {
    "ipAddress": "192.168.1.1",
    "deviceId": "device123"
  }
}
```

### NFT Endpoints

#### GET /nft/wallet/:walletAddress
Get NFTs owned by wallet
```
GET /nft/wallet/0x742d35cc61b8000000000000000000000000000?limit=50&offset=0
```

#### POST /nft/verify-ownership
Quick ownership verification
```json
{
  "walletAddress": "0x742d35cc61b8000000000000000000000000000",
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "tokenId": "42"
}
```

### Collection Endpoints

#### GET /collections
Get all collections
```
GET /collections?category=access&search=VIP&limit=20&offset=0
```

#### GET /collections/:contractAddress
Get collection details
```
GET /collections/0x1234567890123456789012345678901234567890
```

## Project Structure

```
backend/
├── src/
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── logs/                  # Application logs
├── uploads/               # File uploads
└── package.json          # Dependencies and scripts
```

## Database Models

### User
- `walletAddress`: User's wallet address
- `nonce`: Authentication nonce
- `verificationCount`: Number of successful verifications
- `preferences`: User preferences
- `metadata`: Additional user data

### Verification
- `user`: Reference to user
- `walletAddress`: Wallet address
- `contractAddress`: NFT contract address
- `tokenId`: NFT token ID
- `eventName`: Event name
- `location`: Verification location
- `verificationMethod`: Method used (signature, session-code, etc.)
- `result`: Verification result (success/failed)
- `signature`: Digital signature (if applicable)

### Session
- `sessionCode`: 6-digit session code
- `user`: Reference to user
- `walletAddress`: Wallet address
- `contractAddress`: NFT contract address
- `eventName`: Event name
- `location`: Event location
- `expiresAt`: Expiration timestamp
- `isUsed`: Whether code has been used

## Security Features

- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive input validation
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers
- **JWT Authentication**: Secure token-based auth
- **Signature Verification**: Cryptographic signature verification

## Environment Variables

See `env.example` for all available configuration options.

Key variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `CONFLUX_RPC_URL`: Conflux RPC endpoint
- `REDIS_URL`: Redis connection string

## Development

### Code Style
- ESLint for linting
- Prettier for formatting
- Consistent naming conventions
- JSDoc comments for functions

### Testing
```bash
# Run tests
npm test
# or
yarn test
```

### Database Migrations
```bash
# Run migrations
npm run migrate
# or
yarn migrate
```

## Production Deployment

### Docker
```bash
# Build image
docker build -t nfticket-backend .

# Run container
docker run -p 3001:3001 nfticket-backend
```

### Environment Setup
1. Set production environment variables
2. Configure MongoDB replica set
3. Set up Redis cluster
4. Configure load balancer
5. Set up monitoring and logging

## Monitoring

- **Health Check**: `GET /health`
- **Logging**: Winston with multiple transports
- **Metrics**: Custom metrics collection
- **Error Tracking**: Comprehensive error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
