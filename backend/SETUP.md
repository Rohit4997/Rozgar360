# Rozgar360 Backend - Quick Setup Guide

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages (~2-3 minutes).

### Step 2: Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
# macOS:
brew install postgresql
brew services start postgresql

# Create database
createdb rozgar360

# Or using psql:
psql postgres
CREATE DATABASE rozgar360;
\q
```

**Option B: Docker PostgreSQL**
```bash
docker run --name rozgar360-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rozgar360 \
  -p 5432:5432 \
  -d postgres:15
```

**Option C: Use Railway/Render/Supabase** (Cloud)
- Sign up for free PostgreSQL
- Copy DATABASE_URL to `.env`

### Step 3: Configure Environment

Your `.env` file is already created with defaults. Update if needed:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rozgar360
```

### Step 4: Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Name your migration when prompted: "init"
```

You should see:
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

### Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📝 Environment: development
🔗 API URL: http://localhost:3000/api/v1
💾 SMS Provider: mock
```

---

## ✅ Verify Setup

### Test 1: Health Check
```bash
curl http://localhost:3000/api/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rozgar360 API is running",
  "timestamp": "2025-01-..."
}
```

### Test 2: Send OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300
}
```

**Check Console:** You should see the OTP printed:
```
📱 OTP for 9876543210: 1234
```

### Test 3: Verify OTP
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'
```

**Expected Response:**
```json
{
  "success": true,
  "isNewUser": true,
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": null
}
```

---

## 🎯 Quick Test Flow

```bash
# 1. Send OTP
curl -X POST http://localhost:3000/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210"}'

# 2. Note the OTP from console output

# 3. Verify OTP (replace 1234 with actual OTP)
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"1234"}'

# 4. Save the accessToken from response

# 5. Test logout (replace TOKEN with actual token)
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"REFRESH_TOKEN"}'
```

---

## 📊 View Database

```bash
# Open Prisma Studio
npm run prisma:studio
```

This opens a GUI at `http://localhost:5555` where you can:
- View all tables
- See OTP records
- Check users
- View refresh tokens

---

## 🐛 Troubleshooting

### Error: Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Error: Connection to database failed
```bash
# Check PostgreSQL is running
psql -U postgres -d rozgar360

# If connection refused:
brew services restart postgresql

# Or for Docker:
docker start rozgar360-db
```

### Error: Prisma Client not generated
```bash
npm run prisma:generate
```

### Error: Migration failed
```bash
# Reset database and start fresh
npx prisma migrate reset
npm run prisma:migrate
```

### View Logs
```bash
# Check error logs
tail -f logs/error.log

# Check all logs
tail -f logs/combined.log
```

---

## 📁 Project Structure Created

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts       ✅ Prisma client
│   │   └── env.ts            ✅ Environment config
│   ├── controllers/
│   │   └── auth.controller.ts ✅ Auth endpoints
│   ├── services/
│   │   ├── auth.service.ts   ✅ Auth logic
│   │   └── sms.service.ts    ✅ SMS (Mock/MSG91/Twilio)
│   ├── middleware/
│   │   ├── auth.middleware.ts     ✅ JWT validation
│   │   ├── error.middleware.ts    ✅ Error handling
│   │   ├── rateLimit.middleware.ts ✅ Rate limiting
│   │   └── validation.middleware.ts ✅ Request validation
│   ├── routes/
│   │   ├── auth.routes.ts    ✅ Auth routes
│   │   └── index.ts          ✅ Route aggregator
│   ├── validators/
│   │   └── auth.validator.ts ✅ Joi schemas
│   ├── utils/
│   │   ├── jwt.ts            ✅ JWT helpers
│   │   ├── logger.ts         ✅ Winston logger
│   │   └── otp.ts            ✅ OTP helpers
│   ├── app.ts                ✅ Express app
│   └── server.ts             ✅ Server entry
├── prisma/
│   └── schema.prisma         ✅ Database schema
├── logs/                     ✅ Log files
├── .env                      ✅ Environment vars
├── package.json              ✅ Dependencies
├── tsconfig.json             ✅ TypeScript config
└── nodemon.json              ✅ Dev config
```

---

## ✨ Features Implemented

✅ **Authentication Module**
- OTP-based phone authentication
- JWT access & refresh tokens
- Token refresh mechanism
- Secure logout
- Rate limiting (3 OTPs/hour)
- OTP expiry (5 minutes)

✅ **Security**
- JWT authentication
- Request validation
- Rate limiting
- CORS
- Helmet security headers
- Error handling
- Request logging

✅ **Development Features**
- Mock SMS (console output)
- Hot reload (nodemon)
- TypeScript
- Prisma ORM
- Winston logging
- Proper error handling

---

## 🧪 API Testing with Postman

### Import Collection:

**Base URL:** `http://localhost:3000/api/v1`

### Endpoints:

1. **Health Check**
   - GET `/health`

2. **Send OTP**
   - POST `/auth/send-otp`
   - Body: `{"phone":"9876543210"}`

3. **Verify OTP**
   - POST `/auth/verify-otp`
   - Body: `{"phone":"9876543210","otp":"1234"}`

4. **Refresh Token**
   - POST `/auth/refresh-token`
   - Body: `{"refreshToken":"..."}`

5. **Logout**
   - POST `/auth/logout`
   - Headers: `Authorization: Bearer <token>`
   - Body: `{"refreshToken":"..."}`

---

## 🎯 Next Steps

Once authentication is working:

1. **Create User Profile APIs** - Complete profile after signup
2. **Labour Search APIs** - Search and filter workers
3. **Reviews System** - Ratings and feedback
4. **File Upload** - Profile pictures
5. **Notifications** - Push notifications

---

## 💡 Tips

1. **OTP in Console:** In development, OTPs are printed to console
2. **Database GUI:** Use `npm run prisma:studio` to view database
3. **Logs:** Check `logs/` directory for detailed logs
4. **Hot Reload:** Nodemon watches for file changes
5. **Testing:** Use curl or Postman for API testing

---

## ✅ Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] PostgreSQL running
- [ ] Database created
- [ ] Migrations ran (`npm run prisma:migrate`)
- [ ] Server started (`npm run dev`)
- [ ] Health check passed
- [ ] OTP send working
- [ ] OTP verify working
- [ ] Tokens received

If all checked ✅, you're ready to go! 🚀

