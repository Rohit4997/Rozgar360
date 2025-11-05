# Rozgar360 - Backend Requirements & Architecture

## 🛠 Tech Stack

### Core Backend
- **Runtime**: Node.js (v20+)
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma or TypeORM

### Additional Services
- **Authentication**: JWT + Passport.js
- **File Storage**: AWS S3 / Cloudinary (for profile pictures)
- **SMS/OTP**: Twilio / MSG91 / AWS SNS
- **Email**: SendGrid / AWS SES
- **Caching**: Redis
- **Search**: PostgreSQL Full-Text Search / Elasticsearch (optional)
- **Maps/Location**: Google Maps API / Mapbox
- **Real-time**: Socket.io (for notifications, future chat)

### DevOps & Tools
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod / Joi
- **Logging**: Winston / Pino
- **Monitoring**: Sentry
- **Deployment**: AWS / DigitalOcean / Railway
- **CI/CD**: GitHub Actions

---

## 📊 Database Schema

### Tables Required

#### 1. **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255), -- for future email login
  profile_picture_url TEXT,
  bio TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_available BOOLEAN DEFAULT false,
  experience_years INTEGER NOT NULL,
  labour_type VARCHAR(50) NOT NULL, -- daily, monthly, partTime, etc.
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_is_available ON users(is_available);
CREATE INDEX idx_users_location ON users(latitude, longitude);
```

#### 2. **user_skills**
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, skill)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill);
```

#### 3. **otp_verifications**
```sql
CREATE TABLE otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(15) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_otp_phone ON otp_verifications(phone);
CREATE INDEX idx_otp_expires ON otp_verifications(expires_at);
```

#### 4. **refresh_tokens**
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

#### 5. **reviews**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(reviewer_id, reviewee_id)
);

CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

#### 6. **contacts** (Track who contacted whom)
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_type VARCHAR(20) NOT NULL, -- 'call', 'message'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_from_user ON contacts(from_user_id);
CREATE INDEX idx_contacts_to_user ON contacts(to_user_id);
```

#### 7. **search_history**
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
```

#### 8. **notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'profile_view', 'contact', 'review', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

#### 9. **app_settings** (Global settings)
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 10. **reports** (User reports for moderation)
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, resolved, rejected
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
```

---

## 🔌 API Endpoints

### 1. Authentication APIs

#### POST `/api/v1/auth/send-otp`
Send OTP to phone number
```typescript
Request Body:
{
  phone: string; // "9876543210"
}

Response:
{
  success: boolean;
  message: string;
  expiresIn: number; // seconds
}
```

#### POST `/api/v1/auth/verify-otp`
Verify OTP and login/signup
```typescript
Request Body:
{
  phone: string;
  otp: string;
}

Response:
{
  success: boolean;
  isNewUser: boolean; // true if first time login
  accessToken: string;
  refreshToken: string;
  user: UserProfile | null; // null if new user
}
```

#### POST `/api/v1/auth/refresh-token`
Refresh access token
```typescript
Request Body:
{
  refreshToken: string;
}

Response:
{
  accessToken: string;
  refreshToken: string;
}
```

#### POST `/api/v1/auth/logout`
Logout and revoke tokens
```typescript
Headers: Authorization: Bearer <token>

Response:
{
  success: boolean;
  message: string;
}
```

---

### 2. User Profile APIs

#### POST `/api/v1/users/profile` 🔒
Complete profile setup (first time)
```typescript
Request Body:
{
  name: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bio?: string;
  isAvailable: boolean;
  skills: string[];
  experienceYears: number;
  labourType: string;
  latitude?: number;
  longitude?: number;
}

Response:
{
  success: boolean;
  user: UserProfile;
}
```

#### GET `/api/v1/users/profile` 🔒
Get current user's profile
```typescript
Response:
{
  success: boolean;
  user: UserProfile;
}
```

#### PUT `/api/v1/users/profile` 🔒
Update profile
```typescript
Request Body: Same as POST /users/profile

Response:
{
  success: boolean;
  user: UserProfile;
}
```

#### PATCH `/api/v1/users/availability` 🔒
Toggle availability
```typescript
Request Body:
{
  isAvailable: boolean;
}

Response:
{
  success: boolean;
  isAvailable: boolean;
}
```

#### POST `/api/v1/users/upload-picture` 🔒
Upload profile picture
```typescript
Request: multipart/form-data
{
  file: File;
}

Response:
{
  success: boolean;
  profilePictureUrl: string;
}
```

#### DELETE `/api/v1/users/account` 🔒
Delete account
```typescript
Response:
{
  success: boolean;
  message: string;
}
```

---

### 3. Labour Search & Discovery APIs

#### GET `/api/v1/labours` 🔒
Search/filter labours
```typescript
Query Parameters:
{
  search?: string; // name, skill, location
  city?: string;
  skills?: string[]; // comma-separated
  minExperience?: number;
  maxExperience?: number;
  labourType?: string;
  availableOnly?: boolean;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'experience' | 'distance';
}

Response:
{
  success: boolean;
  labours: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### GET `/api/v1/labours/:id` 🔒
Get labour details by ID
```typescript
Response:
{
  success: boolean;
  labour: UserProfile;
}
```

#### GET `/api/v1/labours/nearby` 🔒
Get nearby labours
```typescript
Query Parameters:
{
  latitude: number;
  longitude: number;
  radius: number; // km, default 10
  limit?: number;
}

Response:
{
  success: boolean;
  labours: (UserProfile & { distance: number })[];
}
```

---

### 4. Reviews & Ratings APIs

#### POST `/api/v1/reviews` 🔒
Add review for a labour
```typescript
Request Body:
{
  labourId: string;
  rating: number; // 1-5
  comment?: string;
}

Response:
{
  success: boolean;
  review: Review;
}
```

#### GET `/api/v1/reviews/:userId` 🔒
Get reviews for a user
```typescript
Query Parameters:
{
  page?: number;
  limit?: number;
}

Response:
{
  success: boolean;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  pagination: Pagination;
}
```

#### PUT `/api/v1/reviews/:id` 🔒
Update own review
```typescript
Request Body:
{
  rating: number;
  comment?: string;
}

Response:
{
  success: boolean;
  review: Review;
}
```

#### DELETE `/api/v1/reviews/:id` 🔒
Delete own review
```typescript
Response:
{
  success: boolean;
  message: string;
}
```

---

### 5. Contact Tracking APIs

#### POST `/api/v1/contacts` 🔒
Track contact attempt
```typescript
Request Body:
{
  labourId: string;
  contactType: 'call' | 'message';
}

Response:
{
  success: boolean;
  contact: Contact;
}
```

#### GET `/api/v1/contacts/history` 🔒
Get contact history
```typescript
Query Parameters:
{
  type?: 'sent' | 'received';
  page?: number;
  limit?: number;
}

Response:
{
  success: boolean;
  contacts: Contact[];
  pagination: Pagination;
}
```

---

### 6. Notifications APIs

#### GET `/api/v1/notifications` 🔒
Get user notifications
```typescript
Query Parameters:
{
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

Response:
{
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: Pagination;
}
```

#### PATCH `/api/v1/notifications/:id/read` 🔒
Mark notification as read
```typescript
Response:
{
  success: boolean;
}
```

#### PATCH `/api/v1/notifications/read-all` 🔒
Mark all as read
```typescript
Response:
{
  success: boolean;
  updatedCount: number;
}
```

---

### 7. Settings APIs

#### GET `/api/v1/settings` 🔒
Get user settings
```typescript
Response:
{
  success: boolean;
  settings: {
    language: string;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
}
```

#### PUT `/api/v1/settings` 🔒
Update settings
```typescript
Request Body:
{
  language?: string;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

Response:
{
  success: boolean;
  settings: Settings;
}
```

---

### 8. Reports & Moderation APIs

#### POST `/api/v1/reports` 🔒
Report a user
```typescript
Request Body:
{
  userId: string;
  reason: string;
}

Response:
{
  success: boolean;
  report: Report;
}
```

---

### 9. Analytics APIs (Optional)

#### GET `/api/v1/analytics/profile-views` 🔒
Get profile view count
```typescript
Response:
{
  success: boolean;
  viewCount: number;
  trend: 'up' | 'down' | 'stable';
}
```

#### GET `/api/v1/analytics/search-trends`
Get popular searches (Admin)
```typescript
Response:
{
  success: boolean;
  trends: {
    skill: string;
    count: number;
  }[];
}
```

---

### 10. Admin APIs (Future)

#### GET `/api/v1/admin/users`
Get all users with filters
```typescript
Query Parameters:
{
  status?: 'active' | 'inactive';
  verified?: boolean;
  page?: number;
  limit?: number;
}
```

#### PATCH `/api/v1/admin/users/:id/verify`
Verify a user
```typescript
Response:
{
  success: boolean;
}
```

#### GET `/api/v1/admin/reports`
Get all reports
```typescript
Query Parameters:
{
  status?: 'pending' | 'resolved' | 'rejected';
  page?: number;
  limit?: number;
}
```

---

## 🔐 Authentication Flow

### 1. **Phone-based OTP Flow**

```
1. User enters phone number
   ↓
2. Backend sends OTP via SMS (Twilio/MSG91)
   - Store OTP in database with expiry (5 mins)
   - Rate limit: Max 3 OTPs per hour per phone
   ↓
3. User enters OTP
   ↓
4. Backend verifies OTP
   - If valid & first time → Create user, return tokens
   - If valid & existing → Return tokens
   - If invalid → Return error
   ↓
5. Client stores tokens (AsyncStorage)
   - Access Token (JWT, expires in 15 mins)
   - Refresh Token (expires in 30 days)
```

### 2. **JWT Structure**

**Access Token Payload:**
```typescript
{
  userId: string;
  phone: string;
  iat: number;
  exp: number;
}
```

**Refresh Token:**
- Stored in database
- Can be revoked
- Used to get new access token

---

## 📦 Project Structure

```
rozgar360-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── s3.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── labour.controller.ts
│   │   ├── review.controller.ts
│   │   ├── notification.controller.ts
│   │   └── contact.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── otp.service.ts
│   │   ├── user.service.ts
│   │   ├── labour.service.ts
│   │   ├── review.service.ts
│   │   ├── notification.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── storage.service.ts
│   │   └── location.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── models/ (Prisma/TypeORM)
│   │   ├── User.ts
│   │   ├── Review.ts
│   │   ├── Notification.ts
│   │   └── ...
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── labour.routes.ts
│   │   ├── review.routes.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── validation.ts
│   │   ├── logger.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── express.d.ts
│   │   └── index.ts
│   └── app.ts
├── prisma/ (or typeorm/)
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔧 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rozgar360
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# SMS/OTP (Twilio)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# Or MSG91
MSG91_AUTH_KEY=your-key
MSG91_SENDER_ID=your-sender

# Email (SendGrid)
SENDGRID_API_KEY=your-key
SENDGRID_FROM_EMAIL=noreply@rozgar360.com

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=rozgar360-uploads
AWS_REGION=ap-south-1

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Maps (Google)
GOOGLE_MAPS_API_KEY=your-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 mins
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=your-dsn

# CORS
CORS_ORIGIN=http://localhost:3000,https://app.rozgar360.com
```

---

## 📋 Third-Party Services Required

### 1. **SMS Provider** (Choose one)
- **Twilio** (International, Reliable)
  - Cost: ~$0.01/SMS
  - Best for: Global reach
  
- **MSG91** (India-focused, Cheaper)
  - Cost: ~₹0.10-0.20/SMS
  - Best for: India-only app
  
- **AWS SNS** (Scalable)
  - Cost: $0.00645/SMS (India)

**Recommendation:** MSG91 for India-focused app

### 2. **File Storage** (Choose one)
- **AWS S3**
  - Cost: ~$0.023/GB
  - Scalable, reliable
  
- **Cloudinary**
  - Free tier: 25GB storage, 25GB bandwidth
  - Image optimization built-in
  - Easy to use

**Recommendation:** Cloudinary for easy start, S3 for scale

### 3. **Email Provider** (Choose one)
- **SendGrid**
  - Free tier: 100 emails/day
  - Easy integration
  
- **AWS SES**
  - Cost: $0.10/1000 emails
  - Scalable

**Recommendation:** SendGrid for start

### 4. **Maps/Location**
- **Google Maps API**
  - Geocoding API (address to coordinates)
  - Distance Matrix API (calculate distances)
  - Cost: $5/1000 requests (Geocoding)

**Recommendation:** Google Maps

### 5. **Push Notifications** (Future)
- **Firebase Cloud Messaging (FCM)**
  - Free
  - Best for mobile apps

---

## 🚀 Development Phases

### Phase 1: MVP (Core Features)
**Week 1-2:**
- ✅ Database setup & migrations
- ✅ Authentication (OTP-based)
- ✅ User profile CRUD
- ✅ Basic search & filters

**Week 3-4:**
- ✅ Labour listing & discovery
- ✅ Location-based search
- ✅ Profile pictures upload
- ✅ Basic validation & error handling

### Phase 2: Enhanced Features
**Week 5-6:**
- ✅ Reviews & ratings
- ✅ Contact tracking
- ✅ Notifications
- ✅ Advanced filters

### Phase 3: Optimization & Scale
**Week 7-8:**
- ✅ Redis caching
- ✅ Performance optimization
- ✅ Rate limiting
- ✅ API documentation
- ✅ Unit & integration tests

### Phase 4: Production Ready
**Week 9-10:**
- ✅ Monitoring & logging
- ✅ Security hardening
- ✅ Load testing
- ✅ Deployment setup
- ✅ Admin panel basics

---

## 🔒 Security Checklist

- [ ] JWT token validation on all protected routes
- [ ] Rate limiting on auth endpoints (prevent OTP spam)
- [ ] Input validation & sanitization (prevent SQL injection)
- [ ] CORS configuration
- [ ] Helmet.js for security headers
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS protection
- [ ] File upload validation (size, type)
- [ ] HTTPS only in production
- [ ] Environment variables secured
- [ ] Password hashing (if email login added)
- [ ] Request logging
- [ ] Error messages don't leak sensitive info

---

## 📊 Performance Optimization

### 1. **Database Indexing**
- Phone number, email (unique indexes)
- Location (latitude, longitude)
- Skills, city (for filtering)
- Created_at (for sorting)

### 2. **Caching Strategy (Redis)**
```typescript
// Cache user profiles (30 mins)
redis.setex(`user:${userId}`, 1800, JSON.stringify(user));

// Cache search results (5 mins)
redis.setex(`search:${queryHash}`, 300, JSON.stringify(results));

// Cache popular searches (1 hour)
redis.setex(`trending:skills`, 3600, JSON.stringify(trends));
```

### 3. **Pagination**
- Default limit: 20
- Max limit: 100
- Use offset or cursor-based pagination

### 4. **Database Connection Pooling**
- Min connections: 2
- Max connections: 10

---

## 💰 Cost Estimation (Monthly)

### Hosting (AWS/DigitalOcean)
- **Server**: $10-20/month (2GB RAM, 1 CPU)
- **Database**: $15-25/month (PostgreSQL managed)
- **Redis**: $10/month (managed Redis)

### Third-Party Services
- **SMS (MSG91)**: ₹1000-2000/month (10,000 OTPs)
- **File Storage (Cloudinary)**: Free tier (25GB)
- **Email (SendGrid)**: Free tier
- **Maps API**: $50-100/month (depends on usage)

**Total Estimated Cost**: $100-150/month (~₹8,000-12,000)

For **1000 users** with moderate usage.

---

## 📈 Scaling Considerations

### When to Scale?
- \> 10,000 users
- \> 1000 concurrent requests
- \> 100GB database size

### Scaling Strategy:
1. **Horizontal Scaling**
   - Multiple Express server instances
   - Load balancer (Nginx)
   
2. **Database Scaling**
   - Read replicas
   - Database sharding (if needed)
   
3. **Caching**
   - Redis cluster
   - CDN for static assets

4. **Microservices** (Future)
   - Auth service
   - User service
   - Labour service
   - Notification service

---

## ✅ Next Steps

1. **Setup Development Environment**
   ```bash
   mkdir rozgar360-backend
   cd rozgar360-backend
   npm init -y
   npm install express typescript @types/express prisma
   npx tsc --init
   npx prisma init
   ```

2. **Create Database Schema**
   - Copy SQL schema from above
   - Create Prisma schema
   - Run migrations

3. **Implement Authentication**
   - OTP generation & sending
   - OTP verification
   - JWT token generation

4. **Build Core APIs**
   - User profile APIs
   - Labour search APIs
   - Start with MVP features

5. **Testing**
   - Write unit tests
   - Test with Postman/Insomnia
   - Integrate with mobile app

---

## 📚 Recommended Packages

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "typescript": "^5.3.3",
    "@prisma/client": "^5.7.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "redis": "^4.6.11",
    "multer": "^1.4.5-lts.1",
    "aws-sdk": "^2.1506.0",
    "twilio": "^4.19.1",
    "nodemailer": "^6.9.7",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "prisma": "^5.7.1",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.11",
    "@types/supertest": "^6.0.2"
  }
}
```

---

**Ready to build the backend! 🚀**

Let me know which phase you want to start with, and I can help you implement it step by step.

