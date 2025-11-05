# Rozgar360 Backend API

Backend API for Rozgar360 - Labour Marketplace Application

## Tech Stack

- **Runtime**: Node.js v20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with OTP-based login
- **SMS**: MSG91/Twilio (Mock in development)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rozgar360
JWT_SECRET=your-secret-key-here
SMS_PROVIDER=mock
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### 4. Create logs directory

```bash
mkdir logs
```

### 5. Start Development Server

```bash
npm run dev
```

Server will start on: `http://localhost:3000`

## API Endpoints

### Authentication

#### 1. Send OTP
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Note:** In development mode (SMS_PROVIDER=mock), OTP will be printed in console.

#### 2. Verify OTP
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "9876543210",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "isNewUser": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": null
}
```

**Note:** 
- `isNewUser: true` means user needs to complete profile setup
- `user: null` for new users, full profile for existing users

#### 3. Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

#### 4. Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Testing with cURL

### Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

### Verify OTP (check console for OTP)
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts
│   │   └── env.ts
│   ├── controllers/     # Route controllers
│   │   └── auth.controller.ts
│   ├── services/        # Business logic
│   │   ├── auth.service.ts
│   │   └── sms.service.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/          # API routes
│   │   ├── auth.routes.ts
│   │   └── index.ts
│   ├── validators/      # Request validators
│   │   └── auth.validator.ts
│   ├── utils/           # Utility functions
│   │   ├── jwt.ts
│   │   ├── logger.ts
│   │   └── otp.ts
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Log files
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## Features Implemented

### ✅ Authentication Module
- [x] OTP-based phone authentication
- [x] JWT access & refresh tokens
- [x] Token refresh mechanism
- [x] Logout with token revocation
- [x] Rate limiting (3 OTPs per hour)
- [x] OTP expiry (5 minutes)

### Security Features
- [x] JWT authentication
- [x] Request validation (Joi)
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet security headers
- [x] Error handling
- [x] Request logging

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **OTP Requests**: 3 requests per hour per phone number

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL URL | - |
| JWT_SECRET | JWT secret key | - |
| JWT_ACCESS_EXPIRY | Access token expiry | 15m |
| JWT_REFRESH_EXPIRY | Refresh token expiry | 30d |
| SMS_PROVIDER | SMS provider (mock/msg91/twilio) | mock |
| OTP_LENGTH | OTP digit count | 4 |
| OTP_EXPIRY_MINUTES | OTP validity | 5 |

## Next Steps

1. **Implement User Profile APIs** - Create/Update profile
2. **Implement Labour Search APIs** - Search and filter labours
3. **Add File Upload** - Profile picture upload
4. **Add Reviews System** - Ratings and reviews
5. **Add Notifications** - Push notifications
6. **Production Setup** - Real SMS provider, Redis caching

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres

# Update DATABASE_URL in .env
```

### Prisma Errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database
npx prisma migrate reset
```

## Development Tips

1. **View Logs**: Check `logs/` directory for detailed logs
2. **Database GUI**: Use Prisma Studio `npm run prisma:studio`
3. **API Testing**: Use Postman or curl for testing
4. **Hot Reload**: Nodemon watches for file changes

---

**Status**: ✅ Authentication Module Complete
**Next**: User Profile APIs

